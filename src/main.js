/**
 * Created by wanghx on 4/23/16.
 *
 * main
 *
 */
'use strict';

import Snake from './Snake';
import Map from './Map';
import Stats from './third/stats.min';

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

const MAP_WIDTH = 30000;    // 地图宽度
const MAP_HEIGHT = 30000;   // 地图高度
const CENTER = {            // 中心地址
  x: canvas.width/2,
  y: canvas.height/2
};

// 创建地图对象
const map = new Map({
  canvas,
  width: MAP_WIDTH,
  height: MAP_HEIGHT,
  frame_x: MAP_WIDTH / 2,
  frame_y: MAP_HEIGHT / 2
});

// 获取视窗对象
const frame = map.frame;

// 创建蛇类对象
const snake = new Snake({
  ctx,
  x: frame.x + CENTER.x,
  y: frame.y + CENTER.y,
  tx: -frame.x,
  ty: -frame.y,
  r: 25,
  length: 40,
  color: '#fff'
});

window.onmousemove = function(e) {
  e = e || window.event;

  snake.moveTo(
    frame.x + e.clientX,
    frame.y + e.clientY
  );
};

let time = new Date();
let timeout = 0;
animate();

function animate() {
  const ntime = new Date();

  if (ntime - time > timeout) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let snakeToFrame_x = snake.x - frame.x;     // 蛇相对于视窗的x坐标
    let snakeToFrame_y = snake.y - frame.y;     // 蛇相对于视窗的y坐标
    let needChange_x = CENTER.x - snakeToFrame_x;   // 需要纠正的坐标
    let needChange_y = CENTER.y - snakeToFrame_y;   // 需要纠正的坐标

    // 将蛇的位置纠正到中心位置
    snake.translate(needChange_x, needChange_y);

    // 更新视窗位置
    frame.translate(-needChange_x, -needChange_y);

    map.render();

    snake.render();

    time = ntime;
  }

  stats.update();

  RAF(animate);
}