/**
 * Created by wanghx on 4/23/16.
 *
 * main
 *
 */

import Stats from 'stats.js';
import Snake from './lib/snake';
import Food from './lib/food';
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
document.body.appendChild(stats.dom);

// 初始化地图对象
map.init({
  canvas,
  width: 5000,
  height: 5000
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
  size: 40,
  length: 10,
  color: '#fff'
});

// 食物生成方法
const foodsNum = 100;
const foods = [];
function createFood(num) {
  for (let i = 0; i < num; i++) {
    const point = ~~(Math.random() * 30 + 50);
    const size = ~~(point / 3);

    foods.push(new Food({
      x: ~~(Math.random() * (map.width + size) - 2 * size),
      y: ~~(Math.random() * (map.height + size) - 2 * size),
      size, point
    }));
  }
}

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
    return Math.abs(disX) < (dom.width + dom2.width)
      && Math.abs(disY) < (dom.height + dom2.height);
  }

  return Math.hypot(disX, disY) < (dom.width + dom2.width) / 2;
}

// 创建一些食物
createFood(foodsNum);

// 动画逻辑
const timeout = 0;
let time = new Date();
function animate() {
  const ntime = new Date();

  stats.begin();

  if (ntime - time > timeout) {
    map.clear();

    // 让视窗跟随蛇的位置更改而更改
    frame.track(snake);

    map.render();

    // 渲染食物, 以及检测食物与蛇头的碰撞
    foods.slice(0).forEach(food => {
      food.render();

      if (food.visible && collision(snake.header, food)) {
        foods.splice(foods.indexOf(food), 1);
        snake.eat(food);
        createFood(1);
      }
    });

    snake.render();

    map.renderSmallMap();

    time = ntime;
  }

  stats.end();

  raf(animate);
}

animate();