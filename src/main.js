/**
 * Created by wanghx on 4/23/16.
 *
 * main
 *
 */
'use strict';

import Stats from './third/stats.min';
import Snake from './snake';
import map from './map';

const RAF = window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || window.oRequestAnimationFrame
  || window.msRequestAnimationFrame
  || function(callback) {
    window.setTimeout(callback, 1000 / 60)
  };

const canvas = document.getElementById('cas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const stats = new Stats();
stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.right = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild(stats.domElement);

const MAP_WIDTH = 3000;    // 地图宽度
const MAP_HEIGHT = 3000;   // 地图高度
const CENTER = {            // 中心地址
  x: canvas.width / 2,
  y: canvas.height / 2
};

// 初始化地图对象
map.init({
  canvas,
  width: MAP_WIDTH,
  height: MAP_HEIGHT,
  frame_x: 0,
  frame_y: 0
});

// 创建蛇类对象
const snake = new Snake({
  ctx,
  x: CENTER.x,
  y: CENTER.y,
  r: 25,
  length: 40,
  color: '#fff'
});

window.onmousemove = function(e) {
  e = e || window.event;

  snake.moveTo(
    map.frame.x + e.clientX,
    map.frame.y + e.clientY
  );
};

let time = new Date();
let timeout = 0;
function animate() {
  const ntime = new Date();

  if (ntime - time > timeout) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 位置控制, 保证蛇头位置在视窗中心
    map.frame.translate(
      snake.x - map.frame.x - CENTER.x,
      snake.y - map.frame.y - CENTER.y
    );

    map.render();
    snake.render();

    time = ntime;
  }

  stats.update();

  RAF(animate);
}

animate();