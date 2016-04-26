/**
 * Created by wanghx on 4/25/16.
 *
 * Map 由于地图在整个游戏中只有一个, 所以做成单例的
 *
 */
'use strict';

// 地图类
class Map {
  /**
   * 初始化map对象
   * @param options
   */
  init(options) {
    this.ctx = options.canvas.getContext('2d');
    this.width = options.width;
    this.height = options.height;

    // 背景块的大小
    this.block_w = 150;
    this.block_h = 150;

    // 视窗
    this.frame = new Frame({
      w: options.canvas.width,
      h: options.canvas.height,
      x: options.frame_x,
      y: options.frame_y,
      max_x: this.width - options.frame_x,
      max_y: this.height - options.frame_y
    });
  }

  render() {
    const frame = this.frame;
    const begin_x = (frame.x < 0) ? -frame.x : (-frame.x % this.block_w);
    const begin_y = (frame.y < 0) ? -frame.y : (-frame.y % this.block_h);
    const end_x = begin_x + frame.w;
    const end_y = begin_y + frame.h;

    // 画方格
    this.ctx.strokeStyle = '#fff';
    for (let x = begin_x; x <= end_x; x += this.block_w) {
      for (let y = begin_y; y <= end_y; y += this.block_w) {
        this.ctx.strokeRect(x, y, this.block_w, this.block_h);
      }
    }
  }
}

// 视窗类
class Frame {
  constructor(options) {
    this.w = options.w;
    this.h = options.h;
    this.x = options.x;
    this.y = options.y;
    this.max_x = options.max_x;
    this.max_y = options.max_y;
  }

  /**
   * 移动视窗
   * @param x
   * @param y
   */
  translate(x, y) {
    this.x += x;
    this.y += y;

    // 限制视窗x轴的移动位置, 不能超过地图边界
    //if(this.x < 0) {
    //  this.x = 0;
    //} else if(this.x > this.max_x) {
    //  this.x = this.max_x;
    //}
    //
    //// 限制视窗y轴的移动位置, 不能超过地图边界
    //if(this.y < 0) {
    //  this.y = 0
    //} else if(this.y > this.max_y) {
    //  this.y = this.max_y;
    //}
  }
}

export default new Map();