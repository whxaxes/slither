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
export class Movements {
  [proName: string]: any;

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
  [proName: string]: any;
  img: HTMLCanvasElement;
  vx: number = 0;
  vy: number = 0;
  angle: number;
  tracer?: SnakeBase;
  stopped: boolean = false;
  // save snake's movement
  movementQueue: Array<Movements> = [];
  // maxlength of queue
  movementQueueLen: number;
  speed: number = SPEED;
  private _follower: SnakeBase;

  constructor(options: SnakeBaseOptions) {
    super(options);

    this.angle = options.tracer
      ? options.tracer.angle
      : (options.angle || 0) + BASE_ANGLE;
    this.img = options.img;
    this.tracer = options.tracer;
    this.setSize(options.size);
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
        const j = i + 1;
        const movement = new Movements(
          this.x + xa * j,
          this.y + ya * j,
          this.vx + vxa * j,
          this.vy + vya * j,
          this.angle + aa * j,
        );

        this.movementQueue.push(movement);
      }
    }
  }

  get follower(): SnakeBase {
    return this._follower;
  }

  /**
   * stop moving
   */
  stop() {
    this.stopped = true;

    if (this.follower) {
      this.follower.stop();
    }
  }

  /**
   * continue moving
   */
  continue() {
    this.stopped = false;

    if (this.follower) {
      this.follower.continue();
    }
  }

  /**
   * set size
   */
  setSize(size: number): void {
    this.width = size;
    this.height = size;

    // update movement queue length
    this.movementQueueLen = ~~(0.5 + size * 0.25 / this.speed);
  }

  /**
   * update location
   */
  update(needMove: boolean = true): void {
    if (needMove && !this.stopped) {
      this.move();

      // save movement
      this.movementQueue.push(
        new Movements(this.x, this.y, this.vx, this.vy, this.angle)
      );

      if (this.movementQueue.length > this.movementQueueLen) {
        this.movementQueue.shift();
      }
    }
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
}