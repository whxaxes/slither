/**
 * Created by wanghx on 5/3/16.
 *
 * SnakeBody
 *
 */

import SnakeBase from './SnakeBase';

// 蛇的身躯类
export default class SnakeBody extends SnakeBase {
  constructor(options) {
    super(options);

    // 设置跟踪者
    this.tracer = options.tracer;

    this.tracerDis = this.distance;

    this.savex = this.tox = this.tracer.x - this.distance;
    this.savey = this.toy = this.tracer.y;
  }

  get distance() {
    return this.tracer.width * 0.2;
  }

  update() {
    if (this.tracerDis >= this.distance) {
      const tracer = this.tracer;

      // 计算位置的偏移量
      this.tox = this.savex + ((this.tracerDis - this.distance) * tracer.vx / tracer.speed);
      this.toy = this.savey + ((this.tracerDis - this.distance) * tracer.vy / tracer.speed);

      this.velocity(this.tox, this.toy);

      this.tracerDis = 0;

      // 保存tracer位置
      this.savex = this.tracer.x;
      this.savey = this.tracer.y;
    }

    this.tracerDis += this.tracer.speed;

    if (Math.abs(this.tox - this.x) <= Math.abs(this.vx)) {
      this.x = this.tox;
    } else {
      this.x += this.vx;
    }

    if (Math.abs(this.toy - this.y) <= Math.abs(this.vy)) {
      this.y = this.toy;
    } else {
      this.y += this.vy;
    }
  }

  /**
   * 根据目标点, 计算速度
   * @param x
   * @param y
   */
  velocity(x, y) {
    this.tox = x || this.tox;
    this.toy = y || this.toy;

    const disX = this.tox - this.x;
    const disY = this.toy - this.y;
    const dis = Math.hypot(disX, disY);

    this.vx = this.speed * disX / dis || 0;
    this.vy = this.speed * disY / dis || 0;
  }
}