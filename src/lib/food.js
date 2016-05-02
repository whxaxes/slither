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
    this.lightSize = this.width / 2;        // 食物的半径, 发光半径
    this.lightDirection = true;     // 发光动画方向
  }

  update() {
    const lightSpeed = 1;

    this.lightSize += this.lightDirection ? lightSpeed : -lightSpeed;

    // 当发光圈到达一定值再缩小
    if (this.lightSize > this.width || this.lightSize < this.width / 2) {
      this.lightDirection = !this.lightDirection;
    }
  }

  render() {
    if (!this.visible) {
      return;
    }

    this.update();

    map.ctx.fillStyle = '#fff';

    // 绘制光圈
    map.ctx.globalAlpha = 0.2;
    map.ctx.beginPath();
    map.ctx.arc(
      this.paintX,
      this.paintY,
      this.lightSize * this.paintWidth / this.width,
      0, Math.PI * 2
    );
    map.ctx.fill();

    // 绘制实体
    map.ctx.globalAlpha = 1;
    map.ctx.beginPath();
    map.ctx.arc(this.paintX, this.paintY, this.paintWidth / 2, 0, Math.PI * 2);
    map.ctx.fill();
  }
}
