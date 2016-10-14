import { Base, BaseOptions } from './Base';
import { SPEED, BASE_ANGLE } from '../../common/config';
import { GameMap } from '../framework/GameMap';

export interface SnakeBaseOptions extends BaseOptions {
  img?: HTMLCanvasElement;
  angle?: number;
  tracer?: SnakeBase;
  follower?: SnakeBase;
}

// movement class
class Movements {
  constructor(
    public x: number,
    public y: number,
    public vx: number,
    public vy: number,
    public angle: number
  ) { }
}

// snake base class
export abstract class SnakeBase extends Base {
  img: HTMLCanvasElement;
  vx: number = 0;
  vy: number = 0;
  angle: number;
  tracer?: SnakeBase;
  stopped: boolean = false;
  // save snake's movement
  movementQueue: Array<Movements> = [];
  // length of queue
  movementQueueLen: number = 1;
  private _speed: number;
  private _follower: SnakeBase;

  constructor(options: SnakeBaseOptions) {
    super(options);

    this.angle = (options.angle || 0) + BASE_ANGLE;
    this.img = options.img;
    this.tracer = options.tracer;
    this.velocity();
  }

  set speed(value: number) {
    this._speed = value;

    // recaculate vx and vy
    this.velocity();
  }

  get speed(): number {
    return this._speed
      ? this._speed
      : (this._speed = this.tracer ? this.tracer.speed : SPEED);
  }

  set follower(follower: SnakeBase) {
    this._follower = follower;

    // auto create queue by follower's movement
    if (!this.movementQueue.length && follower) {
      const xa = (this.x - follower.x) / this.movementQueueLen;
      const ya = (this.y - follower.y) / this.movementQueueLen;
      const vxa = (this.vx - follower.vx) / this.movementQueueLen;
      const vya = (this.vy - follower.vy) / this.movementQueueLen;
      const aa = (this.angle - follower.angle) / this.movementQueueLen;

      for (let i = 0; i < this.movementQueueLen; i++) {
        const movement = new Movements(
          this.x + xa * (i + 1),
          this.y + ya * (i + 1),
          this.vx + vxa * (i + 1),
          this.vy + vya * (i + 1),
          this.angle + aa * (i + 1),
        );

        this.movementQueue.push(movement);
      }
    }
  }

  get follower(): SnakeBase {
    return this._follower;
  }

  /**
   * update movement
   */
  updateMovement(movement: Movements) {
    this.x = movement.x;
    this.y = movement.y;
    this.vx = movement.vx;
    this.vy = movement.vy;
    this.angle = movement.angle;
  }

  /**
   * stop moving
   */
  stop() {
    this.stopped = true;
    this.vx = 0;
    this.vy = 0;
  }

  /**
   * set size
   */
  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  /**
   * update location
   */
  update(needMove: boolean = true): void {
    if (needMove && !this.stopped) {
      // save movement
      this.movementQueue.push(
        new Movements(this.x, this.y, this.vx, this.vy, this.angle)
      );

      if (this.movementQueue.length > this.movementQueueLen) {
        this.movementQueue.shift();
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
    ctx.save();
    ctx.translate(this.paintX, this.paintY);
    ctx.rotate(this.angle);
    ctx.drawImage(
      this.img,
      -this.paintWidth / 2,
      -this.paintHeight / 2,
      this.paintWidth,
      this.paintHeight
    );
    ctx.restore();
  }

  abstract move(): void;

  abstract velocity(...args: Array<number>): void;
}