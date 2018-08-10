import WebSocket from 'ws';
import * as config from '../web/common/config';
import * as utils from '../web/common/utils';
const WebSocketServer = WebSocket.Server;
let wss;
let gameLoop;
let stack = [];
let idKey = 0;

function startGameLoop() {
  clearInterval(gameLoop);

  // game loop
  gameLoop = setInterval(() => {
    if (!stack.length) {
      return;
    }

    broadcast(
      utils.encode({
        opt: config.CMD_SYNC_OTHER_COORD,
        data: stack,
      }),
    );

    stack.length = 0;
  }, 100);
}

export function startServer() {
  if (wss) {
    throw new Error('ws server are already created!');
  }

  wss = new WebSocketServer({ port: config.socketPort });
  console.log(`listen port ${config.socketPort}`);

  // start gameLoop
  startGameLoop();

  wss.on('connection', (ws) => {
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

      broadcast(
        utils.encode({
          opt: config.CMD_LOSE_CONNECT,
          data: {
            type: utils.SNAKE_TYPE,
            packet: { id: ws.playerId },
          },
        }),
      );

      wss.clients.forEach((client) => {
        if (client.elements.has(ws.playerId)) {
          client.elements.delete(ws.playerId);
        }
      });
    });

    ws.on('message', (buf) => {
      const obj = utils.decode(buf);
      switch (obj.opt) {
        case config.CMD_INIT:
          const packet = obj.data[0].packet;
          ws.frameWidth = packet.width;
          ws.frameHeight = packet.height;
          ws.playerId = idKey++;
          ws.name = obj.name;

          // init response
          ws.send(
            utils.encode({
              opt: config.CMD_INIT_ACK,
              data: {
                type: utils.SNAKE_TYPE,
                packet: {
                  id: ws.playerId,
                  x: ~~(Math.random() * (config.MAP_WIDTH - 100) + 100 / 2),
                  y: ~~(Math.random() * (config.MAP_HEIGHT - 100) + 100 / 2),
                },
              },
            }),
          );
          break;

        case config.CMD_SYNC_MAIN_COORD:
          stack = stack.concat(obj.data);
          break;

        default:
          break;
      }
    });
  });
}

function broadcast(data) {
  wss.clients.forEach((client) => {
    client.send(data);
  });
}
