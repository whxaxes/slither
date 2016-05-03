/**
 * Created by wanghx on 4/25/16.
 *
 * 地图类 由于地图在整个游戏中只有一个, 所以做成单例
 *
 */

import frame from './frame';
import EventEmitter from 'eventemitter3';
import { MAP_RECT_WIDTH, MAP_RECT_HEIGHT } from './constant';

// 地图类
class Map extends EventEmitter {
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

    // 地图比例
    this.scale = options.scale || 1;
  }

  /**
   * 设置缩放比例
   * @param value
   */
  set scale(value) {
    if (value >= 1.6 || value < 1 || this._scale === value) {
      return;
    }

    this._scale = value;

    this.paintBlockWidth = this.relative(MAP_RECT_WIDTH);
    this.paintBlockHeight = this.relative(MAP_RECT_HEIGHT);
    this.paintWidth = this.relative(this.width);
    this.paintHeight = this.relative(this.height);

    this.emit('scale_changed');
  }

  get scale() {
    return this._scale;
  }

  setScale(scale) {
    this.toScale = scale;
  }

  /**
   * 清空地图上的内容
   */
  clear() {
    this.ctx.clearRect(0, 0, frame.width, frame.height);
  }

  /**
   * 相对于地图scale的值
   * @param val
   * @returns {*}
   */
  relative(val) {
    return val + val * (1 - this.scale);
  }

  /**
   * 对地图本身的更新都在此处进行
   */
  update() {
    if (this.toScale && this.scale !== this.toScale) {
      this.scale = this.toScale;
    }
  }

  /**
   * 渲染地图
   */
  render() {
    this.ctx.save();
    const beginX = (frame.x < 0) ? -frame.x : (-frame.x % this.paintBlockWidth);
    const beginY = (frame.y < 0) ? -frame.y : (-frame.y % this.paintBlockHeight);
    const endX = (frame.x + frame.width > this.paintWidth)
      ? (this.paintWidth - frame.x)
      : (beginX + frame.width + this.paintBlockWidth);
    const endY = (frame.y + frame.height > this.paintHeight)
      ? (this.paintHeight - frame.y)
      : (beginY + frame.height + this.paintBlockHeight);

    // 铺底色
    this.ctx.fillStyle = '#999';
    this.ctx.fillRect(beginX, beginY, endX - beginX, endY - beginY);

    // 画方格砖
    this.ctx.lineWidth = 0.5;
    this.ctx.strokeStyle = '#fff';
    for (let x = beginX; x <= endX; x += this.paintBlockWidth) {
      for (let y = beginY; y <= endY; y += this.paintBlockHeight) {
        const cx = endX - x;
        const cy = endY - y;
        const w = cx < this.paintBlockWidth ? cx : this.paintBlockWidth;
        const h = cy < this.paintBlockHeight ? cy : this.paintBlockHeight;

        this.ctx.strokeRect(x, y, w, h);
      }
    }

    this.ctx.restore();
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
    const smrectw = this.paintWidth > this.paintHeight
      ? smrect
      : (this.paintWidth * smrect / this.paintHeight);
    const smrecth = this.paintWidth > this.paintHeight
      ? (this.paintHeight * smrect / this.paintWidth)
      : smrect;
    const smrectx = smapx - smrectw / 2;
    const smrecty = smapy - smrecth / 2;

    // 相对比例
    const radio = smrectw / this.paintWidth;

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
//    this.ctx.strokeRect(smframex, smframey, smframew, smframeh);

    this.ctx.restore();

    // 画蛇蛇位置
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(smframex + smframew / 2 - 2, smframey + smframeh / 2 - 2, 4, 4);
  }
}

export default new Map();