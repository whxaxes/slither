import 'es6-shim';
import Stats = require('stats.js');
import { GameMap } from './framework/GameMap';
import { Observer } from './framework/Observer';
import { Snake } from './element/Snake';
import * as config from '../common/config';
import * as structs from '../common/structs';
import * as utils from './utils';

const raf: (callback: FrameRequestCallback) => {} = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('cas');

// hot reload
if (module.hot) {
  module.hot.accept();
}

// local ip address
const localIp: string = (<HTMLInputElement>document.getElementById('ip')).value;
let isInit: boolean = false;
// player id
let playerId: number;
// game map
let gamemap: GameMap;
// judge player is an observer or not
let isObserver: boolean = window.location.href.indexOf('Observer=true') >= 0;
// window's width and height
let vWidth: number = window.innerWidth;
let vHeight: number = window.innerHeight;
// player object
let player: Snake | Observer;
// record mouse coord
let mouseCoords: { x?: number, y?: number } = {};

// fps state
const stats: Stats = new Stats();
document.body.appendChild(stats.dom);

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

ws.onclose = () => {
  console.log('closed');

  if (!isInit) {
    const x = ~~(Math.random() * (config.MAP_WIDTH - 100) + 100 / 2);
    const y = ~~(Math.random() * (config.MAP_WIDTH - 100) + 100 / 2);
    initGame(x, y);
  }
};

// receive data
ws.onmessage = e => {
  let obj: utils.EncodeData;
  let data: structs.Struct;
  const buf = e.data;

  if (buf instanceof ArrayBuffer) {
    obj = utils.decode(buf);
  } else {
    obj = JSON.parse(buf);
  }

  switch (obj.opt) {
    case config.CMD_INIT_ACK:
      data = structs.arrayToObj(obj.data, 'snake');
      playerId = data.id;
      initGame(data.x, data.y);
      break;
  }
};

/**
 * game init
 */
function initGame(x: number, y: number): void {
  isInit = true;

  gamemap = new GameMap(canvas, vWidth, vHeight);

  // create player
  if (isObserver) {
    player = new Observer(gamemap, x, y);
  } else {
    player = new Snake({
      gamemap,
      x,
      y,
      size: 40,
      length: 40,
      angle: Math.random() * 2 * Math.PI,
      fillColor: ['#fff', '#333']
    }, false);
  }

  binding();
  animate();
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
    });
  }

  stats.end();
  raf(animate);
}

/**
 * send data
 */
function sendData(data: utils.EncodeData, isBuffer: boolean): void {
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
  if (navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i)) {
    window.addEventListener('touchstart', e => {
      e.preventDefault();
      mouseCoords.x = (<TouchEvent>e).touches[0].pageX + gamemap.view.x;
      mouseCoords.y = (<TouchEvent>e).touches[0].pageY + gamemap.view.y;
      player.moveTo(mouseCoords.x, mouseCoords.y);
    });

    window.addEventListener('touchmove', e => {
      e.preventDefault();
      mouseCoords.x = (<TouchEvent>e).touches[0].pageX + gamemap.view.x;
      mouseCoords.y = (<TouchEvent>e).touches[0].pageY + gamemap.view.y;
      player.moveTo(mouseCoords.x, mouseCoords.y);
    });

    if (player instanceof Observer) {
      window.addEventListener('touchend', e => {
        (<Observer>player).stop();
      });
    }
  } else {
    // change snake's direction when mouse moving 
    window.addEventListener('mousemove', e => {
      const evt: MouseEvent = e || <MouseEvent>window.event;
      mouseCoords.x = evt.clientX + gamemap.view.x;
      mouseCoords.y = evt.clientY + gamemap.view.y;
      player.moveTo(mouseCoords.x, mouseCoords.y);
    });

    // if (player instanceof Snake) {
    //   // speedup
    //   window.addEventListener('mousedown', () => {
    //     (<Snake>player).speedUp();
    //   });

    //   // speeddown
    //   window.addEventListener('mouseup', () => {
    //     (<Snake>player).speedDown();
    //   });
    // }
  }
}