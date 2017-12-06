import * as config from 'common/config';
import * as utils from 'common/utils';
import 'es6-shim';
import Stats = require('stats.js');
import { Base } from '~/element/Base';
import { Food } from '~/element/Food';
import { Snake } from '~/element/Snake';
import { GameMap } from '~/framework/GameMap';
import { Observer } from '~/framework/Observer';

const raf: (callback: FrameRequestCallback) => {} =
  window.requestAnimationFrame || window.webkitRequestAnimationFrame;
const canvas: HTMLCanvasElement = document.getElementById('cas') as HTMLCanvasElement;

// local ip address
const ip: string = (document.getElementById('ip') as HTMLInputElement).value;
let isInit: boolean = false;

// sync data frame count
const syncFrameCount: number = 5;

// player id
let playerId: number | undefined;

// judge player is an observer or not
const isObserver: boolean = window.location.href.indexOf('observer=true') >= 0;
const isStatic: boolean = window.location.href.indexOf('static=true') >= 0;

// window's width and height
const vWidth: number = window.innerWidth;
const vHeight: number = window.innerHeight;

// game map
export const gameMap: GameMap = new GameMap(canvas, vWidth, vHeight);

// player object
let player: Snake | Observer;

// record mouse coord
const mouseCoords: { x?: number; y?: number } = {};

// snakes map
const snakes: Map<any, any> = new Map();

// keycode
const enum KeyCodes {
  W = 87,
  S = 83,
  A = 65,
}

// save food object
const foods: Food[] = [];

// fps state
const stats: Stats = new Stats();
document.body.appendChild(stats.dom);

// websocket
const ws: WebSocket = new WebSocket(`ws://${ip}:${config.socketPort}`);
ws.binaryType = 'arraybuffer';

// websocket connected
ws.onopen = () => {
  sendData(
    {
      opt: config.CMD_INIT,
      data: [vWidth, vHeight],
    },
    true,
  );
};

ws.onerror = () => {
  console.log('error');
};

ws.onclose = (...args: any[]) => {
  if (isInit) {
    return;
  }

  const x = ~~(Math.random() * (config.MAP_WIDTH - 100) + 100 / 2);
  const y = ~~(Math.random() * (config.MAP_WIDTH - 100) + 100 / 2);
  initGame(x, y);
};

// receive data
ws.onmessage = (e) => {
  let bitmap: utils.Bitmap;
  let data: utils.Struct;
  const buf = e.data;

  if (buf instanceof ArrayBuffer) {
    bitmap = utils.decode(buf);
  } else {
    bitmap = JSON.parse(buf);
  }

  switch (bitmap.opt) {
    case config.CMD_INIT_ACK:
      data = utils.arrayToObj(bitmap.data, 'snake');
      playerId = data.id;
      initGame(data.x, data.y);
      break;

    case config.CMD_SYNC_OTHER_COORD:
      if (!isInit) {
        return;
      }

      let snake: Snake;
      data = utils.arrayToObj(bitmap.data, 'snake');

      if (playerId === data.id) {
        return;
      } else if (snakes.has(data.id)) {
        snake = snakes.get(data.id);
        snake.angle = data.angle * Math.PI / 180;
        snake.moveTo(data.x, data.y);
      } else {
        snakes.set(
          data.id,
          (snake = new Snake(
            {
              x: data.x,
              y: data.y,
              angle: data.angle * Math.PI / 180,
              size: data.size,
              fillColor: '#ccc',
              length: data.bodys.length / 2,
            },
            data.bodys,
          )),
        );
      }

      break;

    case config.CMD_LOSE_CONNECT:
      const id = bitmap.data[0];

      if (snakes.has(id)) {
        snakes.delete(id);
      }
      break;

    default:
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
    player = new Observer(gameMap.width / 2, gameMap.height / 2);
  } else {
    player = new Snake({
      x, y,
      size: 30,
      length: 80,
      angle: Math.random() * 2 * Math.PI,
      fillColor: '#000',
    });
  }

  for (let i = 0; i < 2000; i++) {
    const point = ~~(Math.random() * 30 + 50);
    const size = ~~(point / 3);

    foods.push(new Food({
      size, point,
      x: ~~(Math.random() * (gameMap.width - 2 * size) + size),
      y: ~~(Math.random() * (gameMap.height - 2 * size) + size),
    }));
  }

  binding();
  animate();
}

/**
 * collision check
 */
function collision(dom: Base, dom2: Base, isRect?: boolean): boolean {
  const disX = dom.x - dom2.x;
  const disY = dom.y - dom2.y;
  const dw = dom.width + dom2.width;

  if (Math.abs(disX) > dw || Math.abs(disY) > dom.height + dom2.height) {
    return false;
  }

  return isRect ? true : (Math.hypot(disX, disY) < dw / 2);
}

// animation loop
const timeout: number = 0;
let frameCount: number = 0;
let time: number = +new Date();
function animate(): void {
  const newTime: number = +new Date();
  stats.begin();

  if (newTime - time > timeout) {
    time = newTime;

    // update map and player
    gameMap.update(player, () => {
      player.update();

      snakes.forEach((snake) => {
        snake.update();
      });

      if (player instanceof Snake) {
        const snake = player as Snake;
        foods.forEach((food) => {
          food.update();

          if (!food.visible || !collision(snake, food)) {
            return;
          }

          const added = snake.eat(food);
          foods.splice(foods.indexOf(food), 1);

          // 调整地图缩放比例, 调整缩放比例的时候会更新图层, 所以不再次更新
          // const newScale = gameMap.scale + added / (snake.width * 4);
          // if (newScale < 1.4) {
          //   gameMap.setToScale(newScale);
          // }
        });
      }
    });

    // if (mouseCoords.x) {
    //   gameMap.ctx.beginPath();
    //   gameMap.ctx.moveTo((<Snake>player).header.paintX, (<Snake>player).header.paintY);
    //   gameMap.ctx.lineTo(mouseCoords.x, mouseCoords.y);
    //   gameMap.ctx.stroke();
    // }

    if (!(player instanceof Observer) && playerId) {
      frameCount++;

      // sync data per second
      // if (frameCount > config.SYNC_PER_FRAME) {
      //   const bodys: Array<number> = [];
      //   (<Snake>player).bodys.forEach(body => {
      //     bodys.push(body.x.toFixed(2), body.y.toFixed(2));
      //   });

      //   sendData(
      //     {
      //       opt: config.CMD_SYNC_MAIN_COORD,
      //       data: utils.objToArray(
      //         {
      //           id: playerId,
      //           angle: ((<Snake>player).header.angle * (180 / Math.PI)) % 360,
      //           size: (<Snake>player).header.width,
      //           x: (<Snake>player).header.x.toFixed(2),
      //           y: (<Snake>player).header.y.toFixed(2),
      //           bodys,
      //         },
      //         'snake'
      //       ),
      //     },
      //     true
      //   );
      // }
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
      mouseCoords.x = (e as TouchEvent).touches[0].pageX;
      mouseCoords.y = (e as TouchEvent).touches[0].pageY;
    } else {
      const evt: MouseEvent = e || (window.event as MouseEvent);
      mouseCoords.x = evt.clientX;
      mouseCoords.y = evt.clientY;
    }
    const nx = (mouseCoords.x + gameMap.view.x) * gameMap.scale;
    const ny = (mouseCoords.y + gameMap.view.y) * gameMap.scale;

    if (!isObserver || (isObserver && !isStatic)) {
      player.moveTo(nx, ny);
    }
  }

  if (navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i)) {
    window.addEventListener('touchstart', mousemove);
    window.addEventListener('touchmove', mousemove);

    if (player instanceof Observer) {
      window.addEventListener('touchend', (e) => {
        (player as Observer).stop();
      });
    }
  } else {
    // change snake's direction when mouse moving
    window.addEventListener('mousemove', mousemove);

    if (player instanceof Snake) {
      const pl = player as Snake;
      // speedup
      window.addEventListener('mousedown', () => {
        pl.speedUp();
      });

      // speeddown
      window.addEventListener('mouseup', () => {
        pl.speedDown();
      });
    } else {
      window.addEventListener('keyup', (e) => {
        switch (e.keyCode) {
          case KeyCodes.W:
            gameMap.setToScale(gameMap.scale + 0.2);
            break;

          case KeyCodes.S:
            gameMap.setToScale(gameMap.scale - 0.2);
            break;

          case KeyCodes.A:
            gameMap.setToScale(1);
            break;

          default:
            break;
        }
      });
    }
  }
}
