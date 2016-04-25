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

const MAP_WIDTH = 30000;
const MAP_HEIGHT = 30000;

// 创建地图对象
const map = new Map({
  canvas,
  width: MAP_WIDTH,
  height: MAP_HEIGHT,
  frame_x: MAP_WIDTH / 2,
  frame_y: MAP_HEIGHT / 2
});

// 创建蛇类对象
const snake = new Snake({
  ctx,
  x: map.frame_x + canvas.width / 2,
  y: map.frame_y + canvas.height / 2,
  tx: -map.frame_x,
  ty: -map.frame_y,
  r: 25,
  length: 40,
  color: {
    r: 255,
    g: 255,
    b: 255,
    a: 1
  }
});

window.onmousemove = function(e) {
  e = e || window.event;

  snake.moveTo(
    map.frame_x + e.clientX,
    map.frame_y + e.clientY
  );
};

let time = new Date();
let timeout = 0;
animate();

function animate() {
  const ntime = new Date();

  if (ntime - time > timeout) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let snakeArea = snake.getArea();
    let snakeToFrame_x = snakeArea.x - map.frame_x;
    let snakeToFrame_y = snakeArea.y - map.frame_y;
    let needChange_x = canvas.width / 2 - snakeToFrame_x;
    let needChange_y = canvas.height / 2 - snakeToFrame_y;

    snake.translate(needChange_x, needChange_y);

    map.frame_x -= needChange_x;
    map.frame_y -= needChange_y;

    map.render();

    snake.render();

    time = ntime;
  }

  stats.update();

  RAF(animate);
}