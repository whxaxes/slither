'use strict';
const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({ port: 9997 });
const MAP_WID = 10000;
const MAP_HEI = 10000;

const freeFoodsKeys = [];
const foods = new Map();
const foodsNum = 1000;

function createFood(num) {
  for (let i = 0; i < num; i++) {
    const size = ~~(Math.random() * 10 + 10);
    const point = size * 3;

    foods.set(i, {
      x: ~~(Math.random() * (MAP_WID - 2 * size) + size),
      y: ~~(Math.random() * (MAP_HEI - 2 * size) + size),
      size,
      point
    });
  }
}

wss.on('connection', ws => {
  console.log('socket connected');

  ws.on('message', data => {
    const chunks = data.split(':');
    const symbol = chunks[0];
    const value = chunks[1];
    const pos = value.split(',');

    ws.frameWidth = pos[0];
    ws.frameHeight = pos[1];
    ws.snakeX = ~~(Math.random() * (MAP_WID - ws.frameWidth) + ws.frameWidth / 2);
    ws.snakeY = ~~(Math.random() * (MAP_HEI - ws.frameHeight) + ws.frameHeight / 2);

    switch (symbol) {
      case 'init':
        console.log('client inited');
        ws.send(`init:${ws.snakeX},${ws.snakeY}`);
        break;

      default:
        break;
    }
  });
});