'use strict';
const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;
const config = require('./common/config');
const utils = require('./common/utils');
const wss = new WebSocketServer({ port: config.socketPort });

let idKey = 0;

console.log(`listen port ${config.socketPort}`);

wss.on('connection', ws => {
  console.log('socket connected');
  ws.binaryType = 'arraybuffer';

  ws.on('error', () => {
    console.log('error');
  });

  ws.on('message', buf => {
    let obj;

    if (buf instanceof ArrayBuffer || buf instanceof Buffer) {
      obj = utils.decode(buf);
    } else {
      obj = JSON.parse(buf);
    }

    switch (obj.opt) {
      case config.CMD_INIT:
        ws.frameWidth = obj.data[0];
        ws.frameHeight = obj.data[1];
        ws.playerId = idKey++;
        ws.snakeX = ~~(Math.random() * (config.MAP_WIDTH - 100) + 100 / 2);
        ws.snakeY = ~~(Math.random() * (config.MAP_HEIGHT - 100) + 100 / 2);
        ws.name = obj.name;

        // 响应初始化
        ws.send(utils.encode({
          opt: config.CMD_INIT_ACK,
          data: utils.objToArray({
            id: ws.playerId,
            x: ws.snakeX,
            y: ws.snakeY
          }, 'snake')
        }));
        break;

      case config.CMD_SYNC_MAIN_COORD:
        const data = utils.arrayToObj(obj.data, 'snake');
        ws.angle = data.angle;
        ws.size = data.size;
        ws.snakeX = data.x;
        ws.snakeY = data.y;
        ws.bodys = data.bodys;

        wss.clients.forEach((client) => {
          if (client !== ws) {
            client.saves = client.saves || {};

            if (!client.saves[client.playerId]) {
              client.saves[client.playerId] = true;
              client.send(utils.encode({
                opt: config.CMD_SYNC_OTHER_COORD,
                data: obj.data
              }));
            } else {
              client.send(utils.encode({
                opt: config.CMD_SYNC_OTHER_COORD,
                data: utils.objToArray({
                  id: ws.playerId,
                  x: ws.snakeX,
                  y: ws.snakeY,
                  angle: ws.angle
                }, 'snake')
              }));
            }

          }
        });
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