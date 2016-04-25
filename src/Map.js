/**
 * Created by wanghx on 4/25/16.
 *
 * Map
 *
 */
'use strict';

export default class Map {

  constructor(options) {
    this.ctx = options.canvas.getContext('2d');
    this.width = options.width;
    this.height = options.height;

    // 背景块的大小
    this.block_w = 100;
    this.block_h = 100;

    // 视窗位置
    this.frame_w = options.canvas.width;
    this.frame_h = options.canvas.height;
    this.frame_x = options.frame_x || 0;
    this.frame_y = options.frame_y || 0;
  }

  render() {
    const begin_x = this.block_w - this.frame_x % this.block_w;
    const begin_y = this.block_h - this.frame_y % this.block_h;
    const end_x = (this.frame_x + this.frame_w) - (this.frame_x + this.frame_w) % this.block_w;
    const end_y = (this.frame_y + this.frame_h) - (this.frame_y + this.frame_h) % this.block_h;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#999';

    for(let x = begin_x; x <= end_x; x += this.block_w) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.frame_h);
    }

    for(let y = begin_y; y <= end_y; y += this.block_w) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.frame_w, y);
    }

    this.ctx.stroke();
    this.ctx.restore();
  }
}