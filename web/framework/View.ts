import { GameMap } from './GameMap';

export interface ViewTracker {
  x: number;
  y: number;
}

// 视窗
export class View {
  constructor(
    public gameMap: GameMap,
    public width: number,
    public height: number,
    public x: number = 0,
    public y: number = 0,
  ) { }

  public trace(obj: ViewTracker) {
    this.x = (obj.x / this.gameMap.scale) - this.width / 2;
    this.y = (obj.y / this.gameMap.scale) - this.height / 2;
  }

  public absoluteX(x: number) {
    return (x + this.x) * this.gameMap.scale;
  }

  public absoluteY(y: number) {
    return (y + this.y) * this.gameMap.scale;
  }

  public relativeX(x: number) {
    return (x / this.gameMap.scale) - this.x;
  }

  public relativeY(y: number) {
    return (y / this.gameMap.scale) - this.y;
  }

  public relativeW(width: number) {
    return width / this.gameMap.scale;
  }

  public relativeH(height: number) {
    return height / this.gameMap.scale;
  }
}
