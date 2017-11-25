import { GameMap } from './GameMap';

export interface ViewTracker {
  x: number;
  y: number;
}

// 视窗
export class View {
  constructor(
    public gamemap: GameMap,
    public width: number,
    public height: number,
    public x: number = 0,
    public y: number = 0,
  ) { }

  public track(obj: ViewTracker) {
    this.x = (obj.x / this.gamemap.scale) - this.width / 2;
    this.y = (obj.y / this.gamemap.scale) - this.height / 2;
  }

  public absoluteX(x: number) {
    return (x + this.x) * this.gamemap.scale;
  }

  public absoluteY(y: number) {
    return (y + this.y) * this.gamemap.scale;
  }

  public relativeX(x: number) {
    return (x / this.gamemap.scale) - this.x;
  }

  public relativeY(y: number) {
    return (y / this.gamemap.scale) - this.y;
  }

  public relativeW(width: number) {
    return width / this.gamemap.scale;
  }

  public relativeH(height: number) {
    return height / this.gamemap.scale;
  }
}
