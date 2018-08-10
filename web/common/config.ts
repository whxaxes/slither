/**
 * Created by wanghx on 5/3/16.
 *
 * constant
 *
 */

export const CMD_INIT = 100;                     // init cmd
export const CMD_INIT_ACK = 101;                 // init answer cmd
export const CMD_SYNC_MAIN_COORD = 102;          // sync main coordinates
export const CMD_SYNC_OTHER_COORD = 103;         // sync other coordinates
export const CMD_LOSE_CONNECT = 104;             // lose connection

export const port = 9999;                        // server port
export const devPort = port - 1;                 // development port
export const socketPort = port - 2;              // websocket port

export const MAP_WIDTH = 5000;                   // map width
export const MAP_HEIGHT = 5000;                  // map height

export const SPEED = 4;                          // speed of snake
export const BASE_ANGLE = Math.PI * 200;         // base angle of snake

export const MAP_RECT_WIDTH = 200;               // map small rect width
export const MAP_RECT_HEIGHT = 200;              // map small rect height
export const TILE_IMG_WIDTH = 1000;              // tile image width
export const TILE_IMG_HEIGHT = 1000;             // tile image height

export const SNAKE_IMG_SIZE = 60;                // size of snake's image

export const SYNC_PER_FRAME = 5;                 // sync coordinates every 5 frames

export const INIT_FOOD_COUNT = 2000;
