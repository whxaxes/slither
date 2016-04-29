/**
 * Created by wanghx on 4/27/16.
 *
 * food
 *
 */

import Base from './base';
import map from './map';

export default class Food extends Base {
  constructor(options) {
    super(options);

    this.point = options.point;
    this.r = this.width / 2;        // 食物的半径, 发光半径
    this.cr = this.width / 2;       // 食物实体半径
    this.lightDirection = true;     // 发光动画方向
  }

  update() {
    const lightSpeed = 1;

    this.r += this.lightDirection ? lightSpeed : -lightSpeed;

    // 当发光圈到达一定值再缩小
    if (this.r > this.cr * 2 || this.r < this.cr) {
      this.lightDirection = !this.lightDirection;
    }
  }

  render() {
    this.update();

    if (!this.visible) {
      return;
    }

    map.ctx.fillStyle = '#fff';

    // 绘制光圈
    map.ctx.globalAlpha = 0.2;
    map.ctx.beginPath();
    map.ctx.arc(this.paintX, this.paintY, this.r, 0, Math.PI * 2);
    map.ctx.fill();

    // 绘制实体
    map.ctx.globalAlpha = 1;
    map.ctx.beginPath();
    map.ctx.arc(this.paintX, this.paintY, this.cr, 0, Math.PI * 2);
    map.ctx.fill();
  }
}
