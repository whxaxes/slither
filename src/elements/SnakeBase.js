/**
 * Created by wanghx on 5/3/16.
 *
 * SnakeBase
 *
 */

import Base from './Base';
import map from '../map';
import { SPEED, BASE_ANGLE } from '../constant';

// 蛇头和蛇身的基类
export default class SnakeBase extends Base {
  constructor(options) {
    super(options);

    // 垂直和水平速度
    this.vx = SPEED;
    this.vy = 0;

    // 添加贴图
    this.img = options.img;
  }

  // 设置基类的速度
  set speed(val) {
    this._speed = val;

    // 重新计算水平垂直速度
    this.velocity();
  }

  get speed() {
    return this._speed
      ? this._speed
      : (this._speed = this.tracer ? this.tracer.speed : SPEED);
  }

  /**
   * 设置宽度和高度
   * @param width
   * @param height
   */
  setSize(width, height) {
    this.width = width;
    this.height = height || width;
  }

  /**
   * 更新位置
   */
  update() {
    this.x += this.vx;
    this.y += this.vy;
  }

  /**
   * 渲染镜像图片
   */
  render() {
    this.update();

    // 如果该元素在视窗内不可见, 则不进行绘制
    if (!this.visible) return;

    // 如果该对象有角度属性, 则使用translate来绘制, 因为要旋转
    if (this.hasOwnProperty('angle')) {
      map.ctx.save();
      map.ctx.translate(this.paintX, this.paintY);
      map.ctx.rotate(this.angle - BASE_ANGLE - Math.PI / 2);
      map.ctx.drawImage(
        this.img,
        -this.paintWidth / 2,
        -this.paintHeight / 2,
        this.paintWidth,
        this.paintHeight
      );
      map.ctx.restore();
    } else {
      map.ctx.drawImage(
        this.img,
        this.paintX - this.paintWidth / 2,
        this.paintY - this.paintHeight / 2,
        this.paintWidth,
        this.paintHeight
      );
    }

    // 绘制移动方向, debug用
    //    map.ctx.beginPath();
    //    map.ctx.moveTo(
    //      this.paintX - (this.paintWidth * 0.5 * this.vx / this.speed),
    //      this.paintY - (this.paintWidth * 0.5 * this.vy / this.speed)
    //    );
    //    map.ctx.lineTo(this.paintX, this.paintY);
    //    map.ctx.strokeStyle = '#000';
    //    map.ctx.stroke();
  }
}