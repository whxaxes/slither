/**
 * Created by wanghx on 5/3/16.
 *
 * constant
 *
 */

exports.CMD_INIT = 100;                     // 初始化命令
exports.CMD_INIT_ACK = 101;                 // 初始化命令响应
exports.CMD_SYNC_MAIN_COORD = 102;          // 同步坐标
exports.CMD_SYNC_OTHER_COORD = 103;         // 同步坐标
exports.CMD_LOSE_CONNECT = 104;             // 失去连接

exports.port = 9999;                        // 服务端口
exports.devPort = exports.port - 1;         // 开发服务端口
exports.socketPort = exports.port - 2;      // socket服务端口

exports.MAP_WIDTH = 20000;                   // 地图宽度
exports.MAP_HEIGHT = 20000;                  // 地图高度

exports.SPEED = 4;                          // 蛇的速度
exports.BASE_ANGLE = Math.PI * 200;         // 用于保证蛇的角度一直都是正数

exports.MAP_RECT_WIDTH = 150;               // 地图方格宽度
exports.MAP_RECT_HEIGHT = 150;              // 地图方格高度

exports.SNAKE_IMG_SIZE = 60;                // 蛇的图片大小

exports.SYNC_PER_FRAME = 120;