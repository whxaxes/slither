/**
 * Created by wanghx on 4/23/16.
 *
 * main
 *
 */
'use strict';

import Snake from './snake';
import Stats from './third/stats.min';

const sprites = [];
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
document.body.appendChild( stats.domElement );

function init() {
  const snake = new Snake({
    ctx,
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: 30,
    color: {
      r: ~~(255 - Math.random() * 120),
      g: ~~(255 - Math.random() * 120),
      b: ~~(255 - Math.random() * 120),
      a: 1
    }
  });

  sprites.push(snake);

  window.onmousemove = function(e) {
    e = e || window.event;

    snake.moveTo(
      e.clientX,
      e.clientY
    );
  };

  animate();
}

let time = new Date();
let timeout = 0;
function animate() {
  const ntime = new Date();

  if(ntime - time > timeout) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    sprites.forEach(function(sprite) {
      sprite.render();
    });

    time = ntime;
  }

  stats.update();

  RAF(animate);
}

init();