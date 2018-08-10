import { GameMap } from './GameMap';

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
    const ctx = this.image.getContext('2d')!;

    this.smallMapWid = this.gameMap.width > this.gameMap.height
      ? this.radius
      : (this.gameMap.width * this.radius / this.gameMap.height);
    this.smallMapHei = this.gameMap.width > this.gameMap.height
      ? (this.gameMap.height * this.radius / this.gameMap.width)
      : this.radius;

    const smallRectX = this.radius - this.smallMapWid / 2;
    const smallRectY = this.radius - this.smallMapHei / 2;

    // draw background
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.radius, this.radius, this.radius - 1, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    // draw map
    ctx.fillStyle = '#ccc';
    ctx.fillRect(smallRectX, smallRectY, this.smallMapWid, this.smallMapHei);
    ctx.restore();
  }

  public render() {
    // relative ratio
    const radio = this.smallMapWid / this.gameMap.paintWidth;
    const ctx: CanvasRenderingContext2D = this.gameMap.ctx;

    // area and position of window
    const smallViewX = this.gameMap.view.x * radio + this.mapX;
    const smallViewY = this.gameMap.view.y * radio + this.mapY;
    const smallViewW = this.gameMap.view.width * radio;
    const smallViewH = this.gameMap.view.height * radio;

    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.drawImage(this.image, this.x, this.y);

    // draw window
    // ctx.strokeStyle = '#fff';
    // ctx.strokeRect(smallViewX, smallViewY, smallViewW, smallViewH);
    ctx.fillStyle = '#f00';
    ctx.fillRect(
      smallViewX + smallViewW / 2 - 2, smallViewY + smallViewH / 2 - 2,
      4, 4,
    );

    ctx.restore();
  }
}
