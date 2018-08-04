/**
 * Created by wanghx on 5/3/16.
 *
 * constant
 *
 */

exports.CMD_INIT = 100;                     // init cmd
exports.CMD_INIT_ACK = 101;                 // init answer cmd 
exports.CMD_SYNC_MAIN_COORD = 102;          // sync main coordinates
exports.CMD_SYNC_OTHER_COORD = 103;         // sync other coordinates
exports.CMD_LOSE_CONNECT = 104;             // lose connection

exports.port = 9999;                        // server port
exports.devPort = exports.port - 1;         // development port
exports.socketPort = exports.port - 2;      // websocket port

exports.MAP_WIDTH = 5000;                   // map width
exports.MAP_HEIGHT = 5000;                  // map height

exports.SPEED = 4;                          // speed of snake
exports.BASE_ANGLE = Math.PI * 200;         // base angle of snake

exports.MAP_RECT_WIDTH = 200;               // map small rect width
exports.MAP_RECT_HEIGHT = 200;              // map small rect height
exports.TILE_IMG_WIDTH = 1000;              // tile image width
exports.TILE_IMG_HEIGHT = 1000;             // tile image height

exports.SNAKE_IMG_SIZE = 60;                // size of snake's image

exports.SYNC_PER_FRAME = 5;                 // sync coordinates every 5 frames

exports.INIT_FOOD_COUNT = 2000;