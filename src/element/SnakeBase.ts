import { BASE_ANGLE, SPEED } from 'common/config';
import { GameMap } from '~/framework/GameMap';
import { gameMap } from '~/main';
import { Base, BaseOptions } from './Base';
import { SnakeBody } from './SnakeBody';
import { SnakeHeader } from './SnakeHeader';

type FollowerType = SnakeBody | SnakeHeader;
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
    public angle: number,
  ) { }
}

// snake base class
export abstract class SnakeBase extends Base {
  [proName: string]: any;
  public img?: HTMLCanvasElement;
  public vx: number = 0;
  public vy: number = 0;
  public angle: number;
  public tracer?: SnakeBase;
  public stopped: boolean = false;

  // save snake's movement
  public movementQueue: Movements[] = [];

  // maxlength of queue
  public movementQueueLen: number;
  public speed: number = SPEED;
  private privateFollower: FollowerType;

  constructor(options: SnakeBaseOptions) {
    super(options);

    this.angle = options.tracer
      ? options.tracer.angle
      : (options.angle || 0) + BASE_ANGLE;
    this.img = options.img;
    this.tracer = options.tracer;
    this.setSize(options.size);
  }

  set follower(follower: FollowerType) {
    this.privateFollower = follower;

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

  get follower(): FollowerType {
    return this.privateFollower;
  }

  /**
   * stop moving
   */
  public stop() {
    this.stopped = true;

    if (this.follower) {
      this.follower.stop();
    }
  }

  /**
   * continue moving
   */
  public continue() {
    this.stopped = false;

    if (this.follower) {
      this.follower.continue();
    }
  }

  /**
   * set size
   */
  public setSize(size: number): void {
    this.width = size;
    this.height = size;

    // update movement queue length
    this.movementQueueLen = ~~(0.5 + size * 0.25 / this.speed);
  }

  /**
   * update location
   */
  public action(needMove: boolean = true): void {
    if (this.stopped) {
      return;
    }

    this.move();

    // save movement
    this.movementQueue.push(
      new Movements(this.x, this.y, this.vx, this.vy, this.angle),
    );

    if (this.movementQueue.length > this.movementQueueLen) {
      this.movementQueue.shift();
    }
  }

  public abstract move(): void;

  public render(): void {
    if (!this.img || !this.visible) {
      return;
    }

    gameMap.ctx.save();
    gameMap.ctx.translate(this.paintX, this.paintY);
    gameMap.ctx.rotate(this.angle);
    gameMap.ctx.drawImage(
      this.img,
      -this.paintWidth / 2,
      -this.paintHeight / 2,
      this.paintWidth,
      this.paintHeight,
    );
    gameMap.ctx.restore();
  }
}
