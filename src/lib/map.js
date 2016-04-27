/**
 * Created by wanghx on 4/25/16.
 *
 * 地图类 由于地图在整个游戏中只有一个, 所以做成单例
 *
 */
'use strict';

import frame from './frame';

// 地图类
class Map {
  constructor() {
    // 背景块的大小
    this.block_w = 150;
    this.block_h = 150;
  }

  /**
   * 初始化map对象
   * @param options
   */
  init(options) {
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext('2d');

    // 地图大小
    this.width = options.width;
    this.height = options.height;
  }

  /**
   * 清空地图上的内容
   */
  clear() {
    this.ctx.clearRect(0, 0, frame.width, frame.height);
  }

  /**
   * 渲染地图
   */
  render() {
    const begin_x = (frame.x < 0) ? -frame.x : (-frame.x % this.block_w);
    const begin_y = (frame.y < 0) ? -frame.y : (-frame.y % this.block_h);
    const end_x = (frame.x + frame.width > this.width)
      ? (this.width - frame.x)
      : (begin_x + frame.width + this.block_w);
    const end_y = (frame.y + frame.height > this.height)
      ? (this.height - frame.y)
      : (begin_y + frame.height + this.block_h);

    // 铺底色
    this.ctx.fillStyle = '#999';
    this.ctx.fillRect(begin_x, begin_y, end_x - begin_x, end_y - begin_y);

    // 画方格砖
    this.ctx.strokeStyle = '#fff';
    for (let x = begin_x; x <= end_x; x += this.block_w) {
      for (let y = begin_y; y <= end_y; y += this.block_w) {
        let cx = end_x - x;
        let cy = end_y - y;
        let w = cx < this.block_w ? cx : this.block_w;
        let h = cy < this.block_h ? cy : this.block_h;
        this.ctx.strokeRect(x, y, w, h);
      }
    }

    // 画小地图
    this.renderSmallMap();
  }

  /**
   * 画小地图
   */
  renderSmallMap() {
    // 小地图外壳, 圆圈
    const margin = 30;
    const smapr = 50;
    const smapx = frame.width - smapr - margin;
    const smapy = frame.height - smapr - margin;

    // 地图在小地图中的位置和大小
    const smrect = 50;
    const smrectw = this.width > this.height ? smrect : (this.width * smrect / this.height);
    const smrecth = this.width > this.height ? (this.height * smrect / this.width) : smrect;
    const smrectx = smapx - smrectw/2;
    const smrecty = smapy - smrecth/2;

    // 相对比例
    const radio = smrectw / this.width;

    // 视窗在小地图中的位置和大小
    const smframex = frame.x * radio + smrectx;
    const smframey = frame.y * radio + smrecty;
    const smframew = frame.width * radio;
    const smframeh = frame.height * radio;

    this.ctx.save();
    this.ctx.globalAlpha = 0.8;

    // 画个圈先
    this.ctx.beginPath();
    this.ctx.arc(smapx, smapy, smapr, 0, Math.PI * 2);
    this.ctx.fillStyle = '#000';
    this.ctx.fill();
    this.ctx.stroke();

    // 画缩小版地图
    this.ctx.fillStyle = '#999';
    this.ctx.fillRect(smrectx, smrecty, smrectw, smrecth);

    // 画视窗
    this.ctx.strokeRect(smframex, smframey, smframew, smframeh);

    // 画蛇蛇位置
    this.ctx.fillStyle = '#f00';
    this.ctx.fillRect(smframex + smframew / 2 - 1, smframey + smframeh / 2 - 1, 2, 2);

    this.ctx.restore();
  }
}

export default new Map();