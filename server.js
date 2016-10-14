'use strict';
const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;
const config = require('./common/config');
const structs = require('./common/structs');
const wss = new WebSocketServer({ port: config.socketPort });

let idKey = 0;

console.log(`listen port ${config.socketPort}`);

wss.on('connection', ws => {
  console.log('socket connected');
  
  ws.on('message', buf => {
    let obj;

    if (buf instanceof Buffer) {
      obj = decode(buf);
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
        ws.send(encode({
          opt: config.CMD_INIT_ACK,
          data: structs.objToArray({
            id: ws.playerId,
            x: ws.snakeX,
            y: ws.snakeY
          }, 'snake')
        }));
        break;

      case config.CMD_SYNC_MAIN_COORD:
        const data = structs.arrayToObj(obj.data, 'snake');
        ws.angle = data.angle;
        ws.size = data.size;
        ws.snakeX = data.x;
        ws.snakeY = data.y;
        ws.bodys = data.bodys;

        wss.broadcast(encode({
          opt: config.CMD_SYNC_OTHER_COORD,
          data: obj.data
        }));
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

const OPT_LEN = 1; // 操作符长度
const VALUE_LEN = 2; // 值长度

function encode(data) {
  // 操作符1个字节，单个数值两个字节
  const bufLen = OPT_LEN + data.data.length * VALUE_LEN;
  const buf = new Buffer(bufLen);
  buf.writeUInt8(data.opt);
  data.data.forEach((value, i) => {
    buf.writeUInt16BE(Math.abs(parseInt(value)), i * VALUE_LEN + OPT_LEN);
  });
  return buf;
}

function decode(buf) {
  const data = {};
  data.opt = buf.readUInt8();
  data.data = [];
  for (let i = OPT_LEN, max = buf.length - OPT_LEN; i < max; i += VALUE_LEN) {
    data.data.push(buf.readUInt16BE(i));
  }
  return data;
}