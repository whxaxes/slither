import 'es6-shim';
import Stats = require('stats.js');
import { Base } from './element/Base';
import { GameMap } from './framework/GameMap';
import { Observer } from './framework/Observer';
import { SnakeHeader, ServerSnakeHeader } from './element/SnakeHeader';
import { Snake } from './element/Snake';
import { Food } from './element/Food';
import * as config from '../common/config';
import * as utils from '../common/utils';

const raf: (callback: FrameRequestCallback) => {} = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('cas');

// hot reload
if (module.hot) {
  module.hot.accept();
}

// local ip address
let localIp: string = (<HTMLInputElement>document.getElementById('ip')).value;
let isInit: boolean = false;
// sync data frame count
const syncFrameCount: number = 5;
// player id
let playerId: number | undefined;
// judge player is an observer or not
let isObserver: boolean = window.location.href.indexOf('observer=true') >= 0;
// window's width and height
let vWidth: number = window.innerWidth;
let vHeight: number = window.innerHeight;
// game map
let gamemap: GameMap = new GameMap(canvas, vWidth, vHeight);
// player object
let player: Snake | Observer;
// record mouse coord
let mouseCoords: { x?: number, y?: number } = {};
// snakes map
const snakes: Map<any, any> = new Map();
// keycode
const enum KeyCodes {
  W = 87,
  S = 83,
  A = 65
};

// save food object
let foods: Array<Food> = [];

// fps state
const stats: Stats = new Stats();
document.body.appendChild(stats.dom);

if (localIp.indexOf('{{') >= 0) {
  localIp = '127.0.0.1';
}

// websocket
const ws: WebSocket = new WebSocket(`ws://${localIp}:${config.socketPort}`);
ws.binaryType = 'arraybuffer';

// websocket connected
ws.onopen = () => {
  sendData({
    opt: config.CMD_INIT,
    data: [vWidth, vHeight]
  }, true);
};

ws.onerror = () => {
  console.log('error');
};

ws.onclose = (...args: Array<any>) => {
  if (!isInit) {
    const x = ~~(Math.random() * (config.MAP_WIDTH - 100) + 100 / 2);
    const y = ~~(Math.random() * (config.MAP_WIDTH - 100) + 100 / 2);
    initGame(x, y);
  }
};

// receive data
ws.onmessage = e => {
  let obj: utils.Bitmap;
  let data: utils.Struct;
  const buf = e.data;

  if (buf instanceof ArrayBuffer) {
    obj = utils.decode(buf);
  } else {
    obj = JSON.parse(buf);
  }

  switch (obj.opt) {
    case config.CMD_INIT_ACK:
      data = utils.arrayToObj(obj.data, 'snake');
      playerId = data.id;
      initGame(data.x, data.y);
      break;

    case config.CMD_SYNC_OTHER_COORD:
      if (!isInit) {
        return;
      }

      let snake: Snake;
      data = utils.arrayToObj(obj.data, 'snake');

      if (playerId === data.id) {
        return;
      } else if (snakes.has(data.id)) {
        snake = snakes.get(data.id);
        (<ServerSnakeHeader>snake.header).angle = data.angle * Math.PI / 180;
        snake.moveTo(data.x, data.y);
      } else {
        snakes.set(data.id, snake = new Snake({
          gamemap,
          x: data.x,
          y: data.y,
          angle: data.angle * Math.PI / 180,
          size: data.size,
          fillColor: ['#fff', '#999'],
          length: data.bodys.length / 2,
        }, true, data.bodys));
      }

      break;
  }
};

/**
 * game init
 */
function initGame(x: number, y: number): void {
  isInit = true;

  // create player
  if (isObserver) {
    player = new Observer(gamemap, gamemap.width / 2, gamemap.height / 2);
  } else {
    player = new Snake({
      gamemap, x, y,
      size: 30,
      length: 40,
      angle: Math.random() * 2 * Math.PI,
      fillColor: ['#fff', '#333'],
      strokeColor: '#333'
    }, false);
  }

  // for (let i = 0; i < 100; i++) {
  //   const point = ~~(Math.random() * 30 + 50);
  //   const size = ~~(point / 3);

  //   foods.push(new Food({
  //     gamemap, size, point,
  //     x: ~~(Math.random() * (gamemap.width - 2 * size) + size),
  //     y: ~~(Math.random() * (gamemap.height - 2 * size) + size)
  //   }));
  // }

  binding();
  animate();
}

/**
 * collision check
 */
function collision(dom: Base, dom2: Base, isRect?: boolean) {
  const disX = dom.x - dom2.x;
  const disY = dom.y - dom2.y;

  if (isRect) {
    return Math.abs(disX) < (dom.width + dom2.width) &&
      Math.abs(disY) < (dom.height + dom2.height);
  }

  return Math.hypot(disX, disY) < (dom.width + dom2.width) / 2;
}

// animation loop
const timeout: number = 0;
let framecount: number = 0;
let time: number = +new Date();
function animate(): void {
  const ntime: number = +new Date();
  stats.begin();

  if (ntime - time > timeout) {
    time = ntime;

    // update map and player
    gamemap.update(player, () => {
      player.update();

      snakes.forEach(snake => {
        snake.update();
      });

      if (player instanceof Snake) {
        // 渲染食物, 以及检测食物与蛇头的碰撞
        foods.forEach(food => {
          food.update();

          if (food.visible && collision((<Snake>player).header, food)) {
            const added = (<Snake>player).eat(food);
            foods.splice(foods.indexOf(food), 1);

            // 调整地图缩放比例, 调整缩放比例的时候会更新图层, 所以不再次更新
            const newscale = gamemap.scale + added / ((<Snake>player).header.width * 4);
            if (newscale < 1.4) {
              gamemap.setToScale(newscale);
            }

            return;
          }
        });
      }
    });

    // if (mouseCoords.x) {
    //   gamemap.ctx.beginPath();
    //   gamemap.ctx.moveTo((<Snake>player).header.paintX, (<Snake>player).header.paintY);
    //   gamemap.ctx.lineTo(mouseCoords.x, mouseCoords.y);
    //   gamemap.ctx.stroke();
    // }

    if (!(player instanceof Observer) && playerId) {
      framecount++;

      // sync data every seconds
      if (framecount > config.SYNC_PER_FRAME) {
        const bodys: Array<number> = [];
        (<Snake>player).bodys.forEach(body => {
          bodys.push(body.x, body.y);
        });

        sendData({
          opt: config.CMD_SYNC_MAIN_COORD,
          data: utils.objToArray({
            id: playerId,
            angle: ((<Snake>player).header.angle * (180 / Math.PI)) % 360,
            size: (<Snake>player).header.width,
            x: (<Snake>player).header.x,
            y: (<Snake>player).header.y,
            bodys
          }, 'snake')
        }, true);
      }
    }
  }

  stats.end();
  raf(animate);
}

/**
 * send data
 */
function sendData(data: utils.Bitmap, isBuffer: boolean): void {
  let buf: ArrayBuffer | string;
  if (isBuffer) {
    buf = utils.encode(data);
  } else {
    buf = JSON.stringify(data);
  }

  ws.send(buf);
}

/**
 * event binding
 */
function binding() {
  // finger|mouse move event 
  function mousemove(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    if (e instanceof TouchEvent) {
      mouseCoords.x = (<TouchEvent>e).touches[0].pageX;
      mouseCoords.y = (<TouchEvent>e).touches[0].pageY;
    } else {
      const evt: MouseEvent = e || <MouseEvent>window.event;
      mouseCoords.x = evt.clientX;
      mouseCoords.y = evt.clientY;
    }
    const nx = gamemap.relative(mouseCoords.x) + gamemap.view.x;
    const ny = gamemap.relative(mouseCoords.y) + gamemap.view.y;
    player.moveTo(nx, ny);
  }

  if (navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i)) {
    window.addEventListener('touchstart', mousemove);
    window.addEventListener('touchmove', mousemove);

    if (player instanceof Observer) {
      window.addEventListener('touchend', e => {
        (<Observer>player).stop();
      });
    }
  } else {
    // change snake's direction when mouse moving 
    window.addEventListener('mousemove', mousemove);

    if (player instanceof Snake) {
      const pl = <Snake>player;
      // speedup
      window.addEventListener('mousedown', () => {
        pl.speedUp();
      });

      // speeddown
      window.addEventListener('mouseup', () => {
        pl.speedDown();
      });
    } else {
      window.addEventListener('keyup', e => {
        switch (e.keyCode) {
          case KeyCodes.W:
            gamemap.setToScale(gamemap.scale + 0.2);
            break;

          case KeyCodes.S:
            gamemap.setToScale(gamemap.scale - 0.2);
            break;

          case KeyCodes.A:
            gamemap.setToScale(1);
            break;

          default: break;
        }
      });
    }
  }
}