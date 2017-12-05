import { GameMap } from './GameMap';

// 小地图类
export class SmallMap {
  private image: HTMLCanvasElement = document.createElement('canvas');
  private smallMapWid: number;
  private smallMapHei: number;
  private x: number;
  private y: number;
  private mapX: number;
  private mapY: number;

  constructor(
    public gameMap: GameMap,
    private margin: number,
    private radius: number,
  ) { this.initImage(); }

  public initImage(): void {
    this.image.width = this.radius * 2;
    this.image.height = this.radius * 2;
    this.x = this.gameMap.view.width - this.radius * 2 - this.margin;
    this.y = this.gameMap.view.height - this.radius * 2 - this.margin;
    this.mapX = this.x + this.radius / 2;
    this.mapY = this.y + this.radius / 2;
    const ctx: CanvasRenderingContext2D = this.image.getContext('2d');

    this.smallMapWid = this.gameMap.width > this.gameMap.height
      ? this.radius
      : (this.gameMap.width * this.radius / this.gameMap.height);
    this.smallMapHei = this.gameMap.width > this.gameMap.height
      ? (this.gameMap.height * this.radius / this.gameMap.width)
      : this.radius;

    const smallRectX = this.radius - this.smallMapWid / 2;
    const smallRectY = this.radius - this.smallMapHei / 2;

    // 画背景
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.radius, this.radius, this.radius - 1, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    // 绘制地图缩略图
    ctx.drawImage(
      this.gameMap.getThumbnail(this.smallMapWid, this.smallMapHei),
      smallRectX, smallRectY, this.smallMapWid, this.smallMapHei,
    );
    ctx.restore();
  }

  public render() {
    // 相对比例
    const radio = this.smallMapWid / this.gameMap.paintWidth;
    const ctx: CanvasRenderingContext2D = this.gameMap.ctx;

    // 视窗在小地图中的位置和大小
    const smallViewX = this.gameMap.view.x * radio + this.mapX;
    const smallViewY = this.gameMap.view.y * radio + this.mapY;
    const smallViewW = this.gameMap.view.width * radio;
    const smallViewH = this.gameMap.view.height * radio;

    ctx.save();
    ctx.globalAlpha = 0.8;

    ctx.drawImage(this.image, this.x, this.y);

    // 画视窗
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(smallViewX, smallViewY, smallViewW, smallViewH);

    ctx.restore();
  }
}
