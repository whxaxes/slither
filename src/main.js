/**
 * Created by wanghx on 4/23/16.
 *
 * main
 *
 */

import Stats from './third/stats.min';
import Snake from './lib/snake';
import frame from './lib/frame';
import map from './lib/map';

const raf = window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || window.oRequestAnimationFrame
  || window.msRequestAnimationFrame
  || function(callback) {
    window.setTimeout(callback, 1000 / 60);
  };

const canvas = document.getElementById('cas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// fps状态
const stats = new Stats();
stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.right = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild(stats.domElement);

// 初始化地图对象
map.init({
  canvas,
  width: 3000,
  height: 3000
});

// 初始化视窗对象
frame.init({
  x: 1000,
  y: 1000,
  width: canvas.width,
  height: canvas.height
});

// 创建蛇类对象
const snake = new Snake({
  x: frame.x + frame.width / 2,
  y: frame.y + frame.height / 2,
  size: 80,
  length: 60,
  color: '#fff'
});

// 动画逻辑
const timeout = 0;
let time = new Date();
function animate() {
  const ntime = new Date();

  if (ntime - time > timeout) {
    map.clear();

    // 让视窗跟随蛇的位置更改而更改
    frame.track(snake);

    map.render();

    snake.render();

    time = ntime;
  }

  stats.update();

  raf(animate);
}

/**
 * 事件绑定
 */
function binds() {
  window.onmousemove = function(e = window.event) {
    snake.moveTo(
      frame.x + e.clientX,
      frame.y + e.clientY
    );
  };

  window.onmousedown = function() {
    snake.speedUp();
  };

  window.onmouseup = function() {
    snake.speedDown();
  };
}

binds();
animate();