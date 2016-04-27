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

// fps状态
const stats = new Stats();
stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.right = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild(stats.domElement);

// 初始化地图对象
map.init({
  canvas: '#cas',
  width: 3000,
  height: 3000,
  frame_x: 1000,
  frame_y: 1000,
  frame_w: window.innerWidth,
  frame_h: window.innerHeight
});

// 创建蛇类对象
const snake = new Snake({
  x: map.frame.x + map.frame.w / 2,
  y: map.frame.y + map.frame.h / 2,
  r: 25,
  length: 30,
  color: '#fff'
});

// 动画逻辑
let time = new Date(), timeout = 0;
function animate() {
  const ntime = new Date();

  if (ntime - time > timeout) {
    map.clear();

    // 让视窗跟随蛇的位置更改而更改
    map.frame.trace(snake);

    map.render();

    snake.render();

    time = ntime;
  }

  stats.update();

  RAF(animate);
}

/**
 * 事件绑定
 */
function binds(){
  window.onmousemove = function(e) {
    e = e || window.event;

    snake.moveTo(
      map.frame.x + e.clientX,
      map.frame.y + e.clientY
    );
  };

  window.onmousedown = function(){
    snake.speedUp();
  };

  window.onmouseup = function(){
    snake.speedDown();
  };
}

binds();
animate();