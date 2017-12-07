import * as config from 'common/config';
import * as utils from 'common/utils';
import 'es6-shim';
import Stats = require('stats.js');
import { Base } from '~/element/Base';
import { Food } from '~/element/Food';
import { CustomSnake, Movement, Snake } from '~/element/Snake';
import { GameMap } from '~/framework/GameMap';
import { Observer } from '~/framework/Observer';

const raf: (callback: FrameRequestCallback) => {} =
  window.requestAnimationFrame || window.webkitRequestAnimationFrame;
const canvas: HTMLCanvasElement = document.getElementById('cas') as HTMLCanvasElement;

// local ip address
const ip: string = (document.getElementById('ip') as HTMLInputElement).value;
let isInit: boolean = false;

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
const snakes: Map<any, CustomSnake> = new Map();

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
  sendData(config.CMD_INIT, utils.VIEW_TYPE, {
    width: vWidth,
    height: vHeight,
  });
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
  let data;
  const buf = e.data;

  if (buf instanceof ArrayBuffer) {
    data = utils.decode(buf);
  } else {
    data = JSON.parse(buf);
  }

  let packet;
  switch (data.opt) {
    case config.CMD_INIT_ACK:
      packet = data.data[0].packet;
      playerId = packet.id;
      initGame(packet.x, packet.y);
      break;

    case config.CMD_SYNC_OTHER_COORD:
      if (!isInit) {
        return;
      }

      let snake: CustomSnake;
      data.data.forEach((item: any) => {
        packet = item.packet;
        if (item.type === utils.SNAKE_TYPE) {
          if (playerId === packet.id) {
            return;
          } else if (snakes.has(packet.id)) {
            snake = snakes.get(packet.id);
            const movement = new Movement(
              packet.x,
              packet.y,
              packet.speed,
              packet.angle,
            );

            snake.sync(packet.size, packet.length, movement);
          } else {
            snake = new CustomSnake({
              x: packet.x,
              y: packet.y,
              angle: packet.angle,
              size: packet.size,
              length: packet.length,
              fillColor: '#666',
            });
            snakes.set(packet.id, snake);
          }
        } else if (item.type === utils.FOOD_TYPE) {
          // sync food
        }
      });

      break;

    case config.CMD_LOSE_CONNECT:
      packet = data.data[0].packet;
      if (snakes.has(packet.id)) {
        snakes.delete(packet.id);
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
      length: 280,
      angle: Math.random() * 2 * Math.PI,
      fillColor: '#000',
    });
  }

  // for (let i = 0; i < 2000; i++) {
  //   const point = ~~(Math.random() * 30 + 50);
  //   const size = ~~(point / 3);

  //   foods.push(new Food({
  //     size, point,
  //     x: ~~(Math.random() * (gameMap.width - 2 * size) + size),
  //     y: ~~(Math.random() * (gameMap.height - 2 * size) + size),
  //   }));
  // }

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
const timeout: number = 10;
let time: number = +new Date();
function animate(): void {
  const newTime: number = +new Date();
  const snakePlayer = player instanceof Snake
    ? player as Snake
    : null;

  stats.begin();
  if (newTime - time > timeout) {
    time = newTime;

    // update map and player
    gameMap.update(player, () => {
      snakes.forEach((snake) => {
        snake.update();
      });

      player.update();

      if (snakePlayer) {
        foods.forEach((food) => {
          food.update();

          if (!food.visible || !collision(snakePlayer, food)) {
            return;
          }

          const added = snakePlayer.eat(food);
          foods.splice(foods.indexOf(food), 1);

          // 调整地图缩放比例, 调整缩放比例的时候会更新图层, 所以不再次更新
          const newScale = gameMap.scale + added / (snakePlayer.width * 4);
          if (newScale < 1.4) {
            gameMap.setToScale(newScale);
          }
        });
      }
    });

    // if (mouseCoords.x) {
    //   gameMap.ctx.beginPath();
    //   gameMap.ctx.moveTo((<Snake>player).header.paintX, (<Snake>player).header.paintY);
    //   gameMap.ctx.lineTo(mouseCoords.x, mouseCoords.y);
    //   gameMap.ctx.stroke();
    // }

    if (snakePlayer && playerId) {
      sendData(config.CMD_SYNC_MAIN_COORD, utils.SNAKE_TYPE, {
        id: playerId,
        size: snakePlayer.width,
        speed: snakePlayer.speed,
        length: snakePlayer.length,
        x: snakePlayer.x,
        y: snakePlayer.y,
      });
    }
  }

  stats.end();
  raf(animate);
}

// send data
function sendData(opt: number, type: number, packet: any): void {
  ws.send(utils.encode({
    opt,
    data: { type, packet },
  }));
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
