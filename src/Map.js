/**
 * Created by wanghx on 4/25/16.
 *
 * Map
 *
 */
'use strict';

// 地图类
export default class Map {

  constructor(options) {
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
      y: options.frame_y
    });
  }

  render() {
    const frame = this.frame;
    const begin_x = this.block_w - frame.x % this.block_w;
    const begin_y = this.block_h - frame.y % this.block_h;
    const end_x = (frame.x + frame.w) - (frame.x + frame.w) % this.block_w;
    const end_y = (frame.y + frame.h) - (frame.y + frame.h) % this.block_h;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#aaa';

    for (let x = begin_x; x <= end_x; x += this.block_w) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, frame.h);
    }

    for (let y = begin_y; y <= end_y; y += this.block_w) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(frame.w, y);
    }

    this.ctx.stroke();
    this.ctx.restore();
  }
}

// 视窗类
class Frame {
  constructor(options) {
    this.w = options.w;
    this.h = options.h;
    this.x = options.x;
    this.y = options.y;
  }

  /**
   * 移动视窗
   * @param x
   * @param y
   */
  translate(x, y) {
    this.x += x;
    this.y += y;
  }
}