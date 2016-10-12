/**
 * Created by wanghx on 4/23/16.
 *
 * main
 *
 */

import Stats from 'stats.js';
import Snake from './elements/Snake';
import Food from './elements/Food';
import frame from './frame';
import map from './map';
import config from 'config';

const raf = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||

  function(callback) {
    window.setTimeout(callback, 1000 / 60);
  };

const canvas = document.getElementById('cas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// fps状态
const stats = new Stats();
document.body.appendChild(stats.dom);

const localIp = document.getElementById('ip').value;
const ws = new WebSocket(`ws://${localIp}:${config.socketPort}`);
ws.binaryType = 'arraybuffer';
const snakes = new Map();
const foods = new Map();
const isLooker = window.location.href.indexOf('looker') >= 0;
let mainSnake;
let playerId;

/**
 * 发送数据
 * @param data 要发送的数据
 * @param isBuffer 是否为buffer数据
 */
function sendData(data, isBuffer) {
  if (isBuffer) {
    data = encode(data);
  } else {
    data = JSON.stringify(data);
  }

  ws.send(data);
}

ws.onopen = () => {
  sendData({
    opt: config.CMD_INIT,
    name: 'wanghx',
    data: [canvas.width, canvas.height]
  });
};

ws.onmessage = e => {
  let obj;
  const buf = e.data;

  if (buf instanceof ArrayBuffer) {
    obj = decode(buf);
  } else {
    obj = JSON.parse(buf);
  }

  switch (obj.opt) {
    case config.CMD_INIT_ACK:
      playerId = obj.data[0];
      initGame(obj.data[1], obj.data[2]);
      break;

    case config.CMD_SYNC_OTHER_COORD:
      let snake;
      const bodys = obj.data.slice(3);

      if (playerId === obj.data[0]) {
        return;
      } else if (snakes.has(obj.data[0])) {
        snake = snakes.get(obj.data[0]);
      } else {
        snakes.set(obj.data[0], snake = new Snake({
          x: 0,
          y: 0,
          size: 40,
          length: bodys.length / 2
        }));
      }

      snake.header.x = obj.data[1];
      snake.header.y = obj.data[2];
      snake.bodys.forEach((body, i) => {
        body.x = bodys[i * 2];
        body.y = bodys[i * 2 + 1];
      });
      break;

    default:
      break;
  }
};

const OPT_LEN = 1; // 操作符长度
const VALUE_LEN = 2; // 值长度

// 将数据转成arraybuffer
function encode(data) {
  // 操作符1个字节，单个数值两个字节
  const bufLen = OPT_LEN + data.data.length * VALUE_LEN;
  const buf = new ArrayBuffer(bufLen);
  const dv = new DataView(buf);
  dv.setInt8(0, data.opt);
  data.data.forEach((value, i) => {
    dv.setUint16(i * VALUE_LEN + OPT_LEN, parseInt(value));
  });
  return buf;
}

// 将arraybuffer转成对象
function decode(buf) {
  const dv = new DataView(buf);
  const data = {};
  data.opt = dv.getUint8(0);
  data.data = [];
  for (let i = OPT_LEN, max = buf.byteLength - OPT_LEN; i < max; i += VALUE_LEN) {
    data.data.push(dv.getUint16(i));
  }
  return data;
}

/**
 * 初始化游戏
 */
function initGame(x, y) {
  // 事件绑定
  eventBind();

  // 初始化地图对象
  map.init({
    canvas,
    width: config.MAP_WIDTH,
    height: config.MAP_HEIGHT
  });

  // 初始化视窗对象
  frame.init({
    width: canvas.width,
    height: canvas.height
  });

  // 创建蛇类对象
  snakes.set(playerId, mainSnake = new Snake({
    x,
    y,
    size: isLooker ? 1 : 40,
    length: isLooker ? 0 : 10
  }));

  // 动画开始循环
  animate();
}

// // 食物生成方法
// const foodsNum = 1000;
// const foods = [];
// function createFood(num) {
//   for (let i = 0; i < num; i++) {
//     const point = ~~(Math.random() * 30 + 50);
//     const size = ~~(point / 3);

//     foods.push(new Food({
//       x: ~~(Math.random() * (map.width - 2 * size) + size),
//       y: ~~(Math.random() * (map.height - 2 * size) + size),
//       size, point
//     }));
//   }
// }

// // 生成机器蛇
// const robotsNum = 10;
// const robots = [];
// function createRobots(num) {
//   for (let i = 0; i < num; i++) {
//     const size = 40;

//     robots.push(new Snake({
//       x: ~~(Math.random() * (map.width - 2 * size) + size),
//       y: ~~(Math.random() * (map.height - 2 * size) + size),
//       size,
//       length: 10,
//       fillColor: '#ccc',
//       robot: true
//     }))
//   }
// }

/**
 * 碰撞检测
 * @param dom
 * @param dom2
 * @param isRect   是否为矩形
 */
function collision(dom, dom2, isRect) {
  const disX = dom.x - dom2.x;
  const disY = dom.y - dom2.y;

  if (isRect) {
    return Math.abs(disX) < (dom.width + dom2.width) &&
      Math.abs(disY) < (dom.height + dom2.height);
  }

  return Math.hypot(disX, disY) < (dom.width + dom2.width) / 2;
}

// 动画逻辑
const timeout = 0;
let framecount = 0;
let time = new Date();

function animate() {
  const ntime = new Date();

  stats.begin();

  if (ntime - time > timeout) {
    map.clear();

    // 让视窗跟随蛇的位置更改而更改，如果无蛇，则跟随鼠标
    frame.track(mainSnake);

    map.render();

    // 渲染食物, 以及检测食物与蛇头的碰撞
    foods.forEach(food => {
      food.render();

      // if (food.visible && collision(snake.header, food)) {
      //   const added = snake.eat(food);
      //   foods.splice(foods.indexOf(food), 1);
      //   createFood(1);

      //   // 调整地图缩放比例, 调整缩放比例的时候会更新图层, 所以不再次更新
      //   map.setScale(map.scale + added / (snake.header.width * 3));

      //   return;
      // }
    });

    snakes.forEach(snake => {
      snake.update((snake === mainSnake) && isLooker);
    });

    map.renderSmallMap();

    map.update();

    time = ntime;

    if (!isLooker) {
      framecount++;

      // 每5帧同步一次数据
      if (framecount > 5 && !isLooker) {
        sendData({
          opt: config.CMD_SYNC_MAIN_COORD,
          data: mainSnake.getAllCoords()
        });
      }
    }
  }

  stats.end();

  raf(animate);
}

const mouseCoords = {};

function eventBind() {
  // 鼠标/手指 跟蛇运动的交互事件绑定
  if (navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i)) {
    window.addEventListener('touchmove', e => {
      e.preventDefault();
      mouseCoords.x = e.touches[0].pageX + frame.x;
      mouseCoords.y = e.touches[0].pageY + frame.y;
      mainSnake.moveTo(mouseCoords.x, mouseCoords.y);
    });

    window.addEventListener('touchstart', e => {
      e.preventDefault();
      mouseCoords.x = e.touches[0].pageX + frame.x;
      mouseCoords.y = e.touches[0].pageY + frame.y;
      mainSnake.moveTo(mouseCoords.x, mouseCoords.y);
    });
  } else {
    // 蛇头跟随鼠标的移动而变更移动方向
    window.addEventListener('mousemove', (e = window.event) => {
      mouseCoords.x = e.clientX + frame.x;
      mouseCoords.y = e.clientY + frame.y;
      mainSnake.moveTo(mouseCoords.x, mouseCoords.y);
    });

    if (mainSnake) {
      // 鼠标按下让蛇加速
      window.addEventListener('mousedown', mainSnake.speedUp.bind(mainSnake));

      // 鼠标抬起停止加速
      window.addEventListener('mouseup', mainSnake.speedDown.bind(mainSnake));
    }
  }
}