import { SPEED } from '~/common/config';
import { gameMap } from '~/main';

export interface ObserverInterface {
  x: number;
  y: number;
  moveTo(nx: number, ny: number): void;
  update(): void;
}

export class Observer implements ObserverInterface {
  private vx: number = 0;
  private vy: number = 0;

  constructor(
    public x: number,
    public y: number,
  ) { }

  /**
   * stop moving
   */
  public stop(): void {
    this.vx = 0;
    this.vy = 0;
  }

  public moveTo(nx: number, ny: number): void {
    const mx = gameMap.view.relativeX(nx);
    const my = gameMap.view.relativeY(ny);
    const ox = gameMap.view.relativeX(this.x);
    const oy = gameMap.view.relativeY(this.y);
    const xc: number = mx - ox;
    const yc: number = my - oy;
    const hyp: number = Math.sqrt(xc * xc + yc * yc);
    const ratio = 2 * SPEED * gameMap.scale / hyp;
    const limitdis = 200;

    if (Math.abs(ox + gameMap.view.width / 2 - mx) < limitdis
      || Math.abs(oy - gameMap.view.width / 2 - mx) < limitdis) {
      this.vx = xc * ratio;
    } else {
      this.vx = 0;
    }

    if (Math.abs(oy + gameMap.view.height / 2 - my) < limitdis
      || Math.abs(oy - gameMap.view.height / 2 - my) < limitdis) {
      this.vy = yc * ratio;
    } else {
      this.vy = 0;
    }
  }

  public update() {
    this.x += this.vx;
    this.y += this.vy;
    gameMap.limit(this);
  }
}
