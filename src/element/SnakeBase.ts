import { Base, BaseOptions } from './Base';
import { SPEED, BASE_ANGLE } from '../../common/config';
import { GameMap } from '../framework/GameMap';

export interface SnakeBaseOptions extends BaseOptions {
  img: HTMLCanvasElement;
  tracer?: SnakeBase;
  follower?: SnakeBase;
}

export abstract class SnakeBase extends Base {
  img: HTMLCanvasElement;
  vx: number = SPEED;
  vy: number = 0;
  angle: number;
  tracer: SnakeBase | null;
  follower: SnakeBase;
  queue: Array<{ x: number, y: number }> = [];
  private _speed: number;

  constructor(options: SnakeBaseOptions) {
    super(options);

    this.img = options.img;
    this.tracer = options.tracer;
    this.follower = options.follower;
  }

  set speed(value: number) {
    this._speed = value;

    // 重新计算水平垂直速度
    this.velocity();
  }

  get speed(): number {
    return this._speed
      ? this._speed
      : (this._speed = this.tracer ? this.tracer.speed : SPEED);
  }

  get queueLen(): number {
    return 1;
  }

  /**
   * 设置宽高
   */
  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  /**
   * 移动
   */
  abstract move(): void;

  /**
   * 更新位置
   */
  update(needMove: boolean = true): void {
    if (needMove) {
      // 保存运动状态
      this.queue.push({
        x: this.x,
        y: this.y
      });

      if (this.queue.length > this.queueLen) {
        this.queue.shift();
      }

      this.move();
    }

    this.render();
  }

  render(): void {
    if (!this.visible) {
      return;
    }

    const ctx = this.gamemap.ctx;
    // 如果该对象有角度属性, 则使用translate来绘制, 因为要旋转
    if (typeof this.angle === 'number') {
      ctx.save();
      ctx.translate(this.paintX, this.paintY);
      ctx.rotate(this.angle - BASE_ANGLE - Math.PI / 2);
      ctx.drawImage(
        this.img,
        -this.paintWidth / 2,
        -this.paintHeight / 2,
        this.paintWidth,
        this.paintHeight
      );
      ctx.restore();
    } else {
      ctx.drawImage(
        this.img,
        this.paintX - this.paintWidth / 2,
        this.paintY - this.paintHeight / 2,
        this.paintWidth,
        this.paintHeight
      );
    }

    // 绘制移动方向, debug用
    // ctx.beginPath();
    // ctx.moveTo(
    //   this.paintX - (this.paintWidth * 0.5 * this.vx / this.speed),
    //   this.paintY - (this.paintWidth * 0.5 * this.vy / this.speed)
    // );
    // ctx.lineTo(this.paintX, this.paintY);
    // ctx.strokeStyle = '#000';
    // ctx.stroke();
  }

  abstract velocity(...args: Array<number>): void;
}