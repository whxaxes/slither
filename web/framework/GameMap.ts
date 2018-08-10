import { EventEmitter } from 'eventemitter3';
import { MAP_HEIGHT, MAP_RECT_HEIGHT, MAP_RECT_WIDTH, MAP_WIDTH } from '~/common/config';
import { SmallMap } from './SmallMap';
import { View, ViewTracker } from './View';

// Map class
export class GameMap extends EventEmitter {
  public ctx: CanvasRenderingContext2D;
  public view: View;
  public smallMap: SmallMap;
  public readonly width: number = MAP_WIDTH;
  public readonly height: number = MAP_HEIGHT;
  public paintWidth: number;
  public paintHeight: number;

  // map tile
  private tileImage: HTMLCanvasElement = document.createElement('canvas');
  private toScale: number;

  constructor(
    public canvas: HTMLCanvasElement,
    vWidth: number,
    vHeight: number,
    public scale: number = 1,
  ) {
    super();
    this.canvas.width = vWidth;
    this.canvas.height = vHeight;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.paintSizeReset();
    this.view = new View(this, vWidth, vHeight);
    this.smallMap = new SmallMap(this, 30, 50);
    this.createTile();
  }

  // set scale
  public setScale(scale: number): void {
    if (this.scale === scale) {
      return;
    }

    this.scale = scale < 1 ? 1 : scale;
    this.paintSizeReset();
    this.emit('scale_changed');
  }

  // set toScale for creating animate
  public setToScale(scale: number): void {
    this.toScale = scale;
  }

  // relative to scale
  public relative(val: number): number {
    return val / this.scale;
  }

  public clear(): void {
    this.ctx.clearRect(0, 0, this.view.width, this.view.height);
  }

  // update status
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
    this.view.trace(player);
    this.render();
    callback();
    this.smallMap.render();
  }

  // limit element, prevent it moving to outside
  public limit(element: { x: number, y: number, width?: number, height?: number }): void {
    const whalf = (element.width || 1) / 2;
    if (element.x < whalf) {
      element.x = whalf;
    } else if (element.x + whalf > this.width) {
      element.x = this.width - whalf;
    }

    const hhalf = (element.height || 1) / 2;
    if (element.y < hhalf) {
      element.y = hhalf;
    } else if (element.y + hhalf > this.height) {
      element.y = this.height - hhalf;
    }
  }

  // render map
  public render(): void {
    const view = this.view;
    const tileWid = this.relative(this.tileImage.width);
    const tileHei = this.relative(this.tileImage.height);
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
  }

  private paintSizeReset(): void {
    this.paintWidth = this.relative(this.width);
    this.paintHeight = this.relative(this.height);
  }

  // create tile
  private createTile() {
    this.tileImage.width = MAP_RECT_WIDTH * 8;
    this.tileImage.height = MAP_RECT_HEIGHT * 8;
    this.drawPattern(this.tileImage);
  }

  // draw pattern
  private drawPattern(image: HTMLCanvasElement, ratio: number = 1) {
    const ctx = image.getContext('2d')!;
    const colors: string[] = ['#eee', '#aaa'];
    const width = image.width * ratio;
    const height = image.height * ratio;
    const mrw = MAP_RECT_WIDTH / ratio;
    const mrh = MAP_RECT_HEIGHT / ratio;
    for (let x = 0, i = 0; x <= width; x += mrw, i++) {
      for (let y = 0, j = 0; y <= height; y += mrh, j++) {
        const cx = width - x;
        const cy = height - y;
        const w = cx < mrw ? cx : mrw;
        const h = cy < mrh ? cy : mrh;
        ctx.fillStyle = colors[(i + j) % colors.length];
        ctx.fillRect(x, y, w, h);
      }
    }
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, width, height);
  }
}
