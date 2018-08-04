'use strict';
const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;
const config = require('../src/common/config');
const utils = require('../src/common/utils');
const wss = new WebSocketServer({ port: config.socketPort });
let stack = [];
let idKey = 0;

console.log(`listen port ${config.socketPort}`);

setInterval(() => {
  if (stack.length) {
    wss.broadcast(utils.encode({
      opt: config.CMD_SYNC_OTHER_COORD,
      data: stack,
    }));

    stack.length = 0;
  }
}, 100);

wss.on('connection', ws => {
  console.log('socket connected');
  ws.binaryType = 'arraybuffer';
  ws.elements = new Map();

  ws.on('error', () => {
    console.log('error');
  });

  ws.on('close', () => {
    console.log('disconnect!');

    if (!ws.playerId) {
      return;
    }

    wss.broadcast(utils.encode({
      opt: config.CMD_LOSE_CONNECT,
      data: {
        type: utils.SNAKE_TYPE,
        packet: { id: ws.playerId },
      },
    }));

    wss.clients.forEach(client => {
      if (client.elements.has(ws.playerId)) {
        client.elements.delete(ws.playerId);
      }
    });
  });

  ws.on('message', buf => {
    const obj = utils.decode(buf);
    switch (obj.opt) {
      case config.CMD_INIT:
        const packet = obj.data[0].packet;
        ws.frameWidth = packet.width;
        ws.frameHeight = packet.height;
        ws.playerId = idKey++;
        ws.name = obj.name;

        // 响应初始化
        ws.send(utils.encode({
          opt: config.CMD_INIT_ACK,
          data: {
            type: utils.SNAKE_TYPE,
            packet: {
              id: ws.playerId,
              x: ~~(Math.random() * (config.MAP_WIDTH - 100) + 100 / 2),
              y: ~~(Math.random() * (config.MAP_HEIGHT - 100) + 100 / 2),
            },
          }
        }));
        break;

      case config.CMD_SYNC_MAIN_COORD:
        stack = stack.concat(obj.data);
        break;

      default:
        break;
    }
  });
});

wss.broadcast = (data) => {
  wss.clients.forEach((client) => {
    client.send(data);
  });
};