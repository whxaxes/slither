/**
 * Created by wanghx on 4/27/16.
 *
 * food
 *
 */

import { Base, BaseOptions } from './Base';
import { GameMap } from '../framework/GameMap';

interface FoodOptions extends BaseOptions {
  point: number;
}

export class Food extends Base {
  point: number;
  lightSize: number;
  lightDirection: boolean = true;

  constructor(options: FoodOptions) {
    super(options);

    this.point = options.point;
    this.lightSize = this.width / 2;        // 食物的半径, 发光半径
  }

  update() {
    const lightSpeed = 1;

    this.lightSize += this.lightDirection ? lightSpeed : -lightSpeed;

    // 当发光圈到达一定值再缩小
    if (this.lightSize > this.width || this.lightSize < this.width / 2) {
      this.lightDirection = !this.lightDirection;
    }

    this.render();
  }

  render() {
    if (!this.visible) {
      return;
    }

    const ctx = this.gamemap.ctx;

    ctx.fillStyle = '#fff';

    // 绘制光圈
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.arc(
      this.paintX,
      this.paintY,
      this.lightSize * this.paintWidth / this.width,
      0, Math.PI * 2
    );
    ctx.fill();

    // 绘制实体
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(this.paintX, this.paintY, this.paintWidth / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
