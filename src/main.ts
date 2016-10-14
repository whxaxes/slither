import 'es6-shim';
import Stats = require('stats.js');
import { GameMap } from './framework/GameMap';
import { Looker } from './framework/Looker';
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

// ip地址
const localIp: string = (<HTMLInputElement>document.getElementById('ip')).value;

// 是否初始化完毕
let isInit: boolean = false;
// 玩家id
let playerId: number;
// 游戏地图
let gamemap: GameMap;
// 是否观察者模式
let isLooker: boolean = window.location.href.indexOf('looker=true') >= 0;
// 视窗宽高
let vWidth: number = window.innerWidth;
let vHeight: number = window.innerHeight;
// 玩家
let player: Snake | Looker;
// 记录鼠标位置
let mouseCoords: { x?: number, y?: number } = {};

// fps state
const stats: Stats = new Stats();
document.body.appendChild(stats.dom);

// websocket实例
const ws: WebSocket = new WebSocket(`ws://${localIp}:${config.socketPort}`);
ws.binaryType = 'arraybuffer';

// websocket连接成功
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

  // 如果未初始化，则采用单机版
  if (!isInit) {
    const x = ~~(Math.random() * (config.MAP_WIDTH - 100) + 100 / 2);
    const y = ~~(Math.random() * (config.MAP_WIDTH - 100) + 100 / 2);
    initGame(x, y);
  }
};

// 接收信息推送
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
 * 初始化游戏
 */
function initGame(x: number, y: number): void {
  isInit = true;

  gamemap = new GameMap(canvas, vWidth, vHeight);

  // 创建玩家对象
  if (isLooker) {
    player = new Looker(gamemap, x, y);
  } else {
    player = new Snake({
      gamemap,
      x,
      y,
      size: 40,
      length: 40,
      fillColor: ['#fff', '#333']
    }, false);
  }

  binding();
  animate();
}

// 动画循环
const timeout: number = 0;
let framecount: number = 0;
let time: number = +new Date();
function animate(): void {
  const ntime: number = +new Date();
  stats.begin();

  if (ntime - time > timeout) {
    time = ntime;

    // 更新地图，并且更新玩家操作
    gamemap.update(player, () => {
      player.update();
    });
  }

  stats.end();
  raf(animate);
}

/**
 * 发送数据
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
 * 事件绑定
 */
function binding() {
  // 鼠标/手指 跟蛇运动的交互事件绑定
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

    if (player instanceof Looker) {
      window.addEventListener('touchend', e => {
        (<Looker>player).stop();
      });
    }
  } else {
    // 蛇头跟随鼠标的移动而变更移动方向
    window.addEventListener('mousemove', e => {
      const evt: MouseEvent = e || <MouseEvent>window.event;
      mouseCoords.x = evt.clientX + gamemap.view.x;
      mouseCoords.y = evt.clientY + gamemap.view.y;
      player.moveTo(mouseCoords.x, mouseCoords.y);
    });

    // if (player instanceof Snake) {
    //   // 鼠标按下让蛇加速
    //   window.addEventListener('mousedown', () => {
    //     (<Snake>player).speedUp();
    //   });

    //   // 鼠标抬起停止加速
    //   window.addEventListener('mouseup', () => {
    //     (<Snake>player).speedDown();
    //   });
    // }
  }
}