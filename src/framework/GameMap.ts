import { MAP_HEIGHT, MAP_RECT_HEIGHT, MAP_RECT_WIDTH, MAP_WIDTH } from 'common/config';
import { EventEmitter } from 'eventemitter3';
import { SmallMap } from './SmallMap';
import { View, ViewTracker } from './View';

// Map class
export class GameMap extends EventEmitter {
  public ctx: CanvasRenderingContext2D;
  public view: View;
  public smallmap: SmallMap;
  public readonly width: number = MAP_WIDTH;
  public readonly height: number = MAP_HEIGHT;
  public paintWidth: number;
  public paintHeight: number;
  // 地图瓦片
  private tileImage: HTMLCanvasElement = document.createElement('canvas');
  private viewWidth: number;
  private viewHeight: number;
  private toScale: number;

  constructor(
    public canvas: HTMLCanvasElement,
    vwidth: number,
    vheight: number,
    public scale: number = 1,
  ) {
    super();
    this.canvas.width = vwidth;
    this.canvas.height = vheight;
    this.ctx = this.canvas.getContext('2d');
    this.paintSizeReset();
    this.view = new View(this, vwidth, vheight);
    this.smallmap = new SmallMap(this, 30, 50);
    this.createTile();
  }

  /**
   * 设置map的缩放比例
   */
  public setScale(scale: number): void {
    if (this.scale === scale) {
      return;
    }

    this.scale = scale < 1 ? 1 : scale;
    this.paintSizeReset();
    this.emit('scale_changed');
  }

  /**
   * 设置目标scale
   */
  public setToScale(scale: number): void {
    this.toScale = scale;
  }

  /**
   * 相对于地图scale的值
   * @param val
   * @returns {*}
   */
  public relative(val: number): number {
    return val / this.scale;
  }

  /**
   * 清空画布
   */
  public clear(): void {
    this.ctx.clearRect(0, 0, this.view.width, this.view.height);
  }

  /**
   * 对地图本身的更新都在此处进行
   */
  public update(player: ViewTracker, callback: () => void): void {
    if (this.toScale && this.scale !== this.toScale) {
      // const scaleDis = this.toScale - this.scale;
      // if (Math.abs(scaleDis) < 0.01) {
      //   this.setScale(this.toScale);
      // } else {
      //   this.setScale(this.scale + (this.toScale - this.scale) * 0.1);
      // }

      this.setScale(this.toScale);
    }

    this.ctx.clearRect(0, 0, this.view.width, this.view.height);
    this.view.track(player);
    this.render();
    callback();
    this.smallmap.render();
  }

  /**
   * 限制element的位置
   */
  public limit(element: { x: number, y: number, width?: number, height?: number }): void {
    const whalf: number = (element.width || 1) / 2;
    if (element.x < whalf) {
      element.x = whalf;
    } else if (element.x + whalf > this.width) {
      element.x = this.width - whalf;
    }

    const hhalf: number = (element.height || 1) / 2;
    if (element.y < hhalf) {
      element.y = hhalf;
    } else if (element.y + hhalf > this.height) {
      element.y = this.height - hhalf;
    }
  }

  /**
   * 渲染地图
   */
  public render(): void {
    const view = this.view;
    const tileWid = this.relative(this.tileImage.width);
    const tileHei = this.relative(this.tileImage.height);
    this.ctx.save();
    const beginX = (view.x < 0) ? -view.x : (-view.x % tileWid);
    const beginY = (view.y < 0) ? -view.y : (-view.y % tileHei);
    const endX = (view.x + view.width > this.paintWidth)
      ? (this.paintWidth - view.x)
      : (beginX + view.width + tileWid);
    const endY = (view.y + view.height > this.paintHeight)
      ? (this.paintHeight - view.y)
      : (beginY + view.height + tileHei);

    for (let x = beginX; x <= endX; x += tileWid) {
      for (let y = beginY; y <= endY; y += tileHei) {
        const cx = endX - x;
        const cy = endY - y;
        const w = cx < tileWid ? cx : tileWid;
        const h = cy < tileHei ? cy : tileHei;
        this.ctx.drawImage(this.tileImage, 0, 0, w * this.scale, h * this.scale, x, y, w, h);
      }
    }

    this.ctx.restore();
  }

  /**
   * 获取缩略图
   */
  public getThumbnail(width: number, height: number): HTMLCanvasElement {
    const image = document.createElement('canvas');
    image.width = width;
    image.height = height;
    this.drawPattern(image, this.width / width);
    return image;
  }

  /**
   * 绘制参数变更
   */
  private paintSizeReset(): void {
    this.paintWidth = this.relative(this.width);
    this.paintHeight = this.relative(this.height);
  }

  /**
   * 创建瓦片
   */
  private createTile() {
    this.tileImage.width = MAP_RECT_WIDTH * 10;
    this.tileImage.height = MAP_RECT_HEIGHT * 10;
    this.drawPattern(this.tileImage);
  }

  /**
   * 绘制花纹
   */
  private drawPattern(image: HTMLCanvasElement, ratio: number = 1) {
    const ctx = image.getContext('2d');
    const colors: string[] = ['#ccc', '#999'];
    let color: string;
    const width = image.width * ratio;
    const height = image.height * ratio;
    const mrw = MAP_RECT_WIDTH / ratio;
    const mrh = MAP_RECT_HEIGHT / ratio;
    for (let x = 0, i = 0; x <= width; x += mrw, i++) {
      color = colors[i % 2];
      for (let y = 0; y <= height; y += mrh) {
        const cx = width - x;
        const cy = height - y;
        const w = cx < mrw ? cx : mrw;
        const h = cy < mrh ? cy : mrh;
        ctx.fillStyle = color;
        color = (color === colors[0]) ? colors[1] : colors[0];
        ctx.fillRect(x, y, w, h);
      }
    }
  }
}
