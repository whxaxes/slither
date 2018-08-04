import { gameMap } from '~/main';
import { Base, BaseOptions } from './Base';

interface FoodOptions extends BaseOptions {
  point: number;
}

export class Food extends Base {
  public point: number;
  public lightSize: number;
  public lightDirection: boolean = true;

  constructor(options: FoodOptions) {
    super(options);

    this.point = options.point;
    this.lightSize = this.width / 2;
  }

  public action() {
    if (!this.visible) {
      return;
    }

    const lightSpeed = 1;

    this.lightSize += this.lightDirection ? lightSpeed : -lightSpeed;

    // light animate
    if (this.lightSize > this.width || this.lightSize < this.width / 2) {
      this.lightDirection = !this.lightDirection;
    }
  }

  public render() {
    if (!this.visible) {
      return;
    }

    gameMap.ctx.fillStyle = '#fff';

    // draw light
    gameMap.ctx.globalAlpha = 0.2;
    gameMap.ctx.beginPath();
    gameMap.ctx.arc(
      this.paintX,
      this.paintY,
      this.lightSize * this.paintWidth / this.width,
      0, Math.PI * 2,
    );
    gameMap.ctx.fill();

    gameMap.ctx.globalAlpha = 1;
    gameMap.ctx.beginPath();
    gameMap.ctx.arc(this.paintX, this.paintY, this.paintWidth / 2, 0, Math.PI * 2);
    gameMap.ctx.fill();
  }
}
