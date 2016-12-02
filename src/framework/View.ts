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
    public y: number = 0
  ) {
    // 监听gamemap的缩放事件
    this.gamemap.on('scale_changed', () => {
      this.x = gamemap.relative(this.x);
      this.y = gamemap.relative(this.y);
    });
  }

  track(obj: ViewTracker) {
    this.x = this.gamemap.relative(obj.x) - this.width / 2;
    this.y = this.gamemap.relative(obj.y) - this.height / 2;
  }

  relativeX(x: number) {
    return this.gamemap.relative(x) - this.x;
  }

  relativeY(y: number) {
    return this.gamemap.relative(y) - this.y;
  }

  relativeW(width: number) {
    return this.gamemap.relative(width);
  }

  relativeH(height: number) {
    return this.gamemap.relative(height);
  }
}