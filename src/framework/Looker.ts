import { GameMap } from './GameMap';
import { SPEED } from '../../common/config';

export interface LookerInterface {
  gamemap: GameMap;
  x: number;
  y: number;
  moveTo(nx: number, ny: number): void;
  update(): void;
}

export class Looker implements LookerInterface {
  private vx: number = 0;
  private vy: number = 0;

  constructor(
    public gamemap: GameMap,
    public x: number,
    public y: number
  ) { }

  /**
   * 停止
   */
  stop(): void {
    this.vx = 0;
    this.vy = 0;
  }

  moveTo(nx: number, ny: number): void {
    const xc: number = nx - this.x;
    const yc: number = ny - this.y;
    const hyp: number = Math.sqrt(xc * xc + yc * yc);
    const ratio = 2 * SPEED / hyp;
    this.vx = xc * ratio;
    this.vy = yc * ratio;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.gamemap.limit(this);
  }
}