import { GameMap } from './GameMap';

// 小地图类
export class SmallMap {
  private image: HTMLCanvasElement = document.createElement('canvas');
  private smallMapWid: number;
  private smallMapHei: number;
  private x: number;
  private y: number;
  private mapx: number;
  private mapy: number;

  constructor(
    private gamemap: GameMap,
    private margin: number,
    private radius: number,
  ) { this.initImage(); }

  public initImage(): void {
    this.image.width = this.radius * 2;
    this.image.height = this.radius * 2;
    this.x = this.gamemap.view.width - this.radius * 2 - this.margin;
    this.y = this.gamemap.view.height - this.radius * 2 - this.margin;
    this.mapx = this.x + this.radius / 2;
    this.mapy = this.y + this.radius / 2;
    const ctx: CanvasRenderingContext2D = this.image.getContext('2d');

    this.smallMapWid = this.gamemap.width > this.gamemap.height
      ? this.radius
      : (this.gamemap.width * this.radius / this.gamemap.height);
    this.smallMapHei = this.gamemap.width > this.gamemap.height
      ? (this.gamemap.height * this.radius / this.gamemap.width)
      : this.radius;

    const smrectx = this.radius - this.smallMapWid / 2;
    const smrecty = this.radius - this.smallMapHei / 2;

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
      this.gamemap.getThumbnail(this.smallMapWid, this.smallMapHei),
      smrectx, smrecty, this.smallMapWid, this.smallMapHei,
    );
    ctx.restore();
  }

  public render() {
    // 相对比例
    const radio = this.smallMapWid / this.gamemap.paintWidth;
    const ctx: CanvasRenderingContext2D = this.gamemap.ctx;

    // 视窗在小地图中的位置和大小
    const smviewx = this.gamemap.view.x * radio + this.mapx;
    const smviewy = this.gamemap.view.y * radio + this.mapy;
    const smvieww = this.gamemap.view.width * radio;
    const smviewh = this.gamemap.view.height * radio;

    ctx.save();
    ctx.globalAlpha = 0.8;

    ctx.drawImage(this.image, this.x, this.y);

    // 画视窗
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(smviewx, smviewy, smvieww, smviewh);

    ctx.restore();
  }
}
