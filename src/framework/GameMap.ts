import { EventEmitter } from 'eventemitter3';
import { MAP_WIDTH, MAP_HEIGHT, MAP_RECT_WIDTH, MAP_RECT_HEIGHT } from '../../common/config';

interface ViewTracker {
  x: number;
  y: number;
}

// Map class
export class GameMap extends EventEmitter {
  ctx: CanvasRenderingContext2D;
  view: View;
  readonly width: number = MAP_WIDTH;
  readonly height: number = MAP_HEIGHT;
  private paintBlockWidth: number;
  private paintBlockHeight: number;
  private paintWidth: number;
  private paintHeight: number;
  private viewWidth: number;
  private viewHeight: number;
  private toScale: number;

  constructor(
    public canvas: HTMLCanvasElement,
    vwidth: number,
    vheight: number,
    public scale: number = 1
  ) {
    super();
    this.canvas.width = vwidth;
    this.canvas.height = vheight;
    this.ctx = this.canvas.getContext('2d');
    this.paintSizeReset();
    this.view = new View(this, vwidth, vheight);
  }

  /**
   * 绘制参数变更
   */
  private paintSizeReset(): void {
    this.paintBlockWidth = this.relative(MAP_RECT_WIDTH);
    this.paintBlockHeight = this.relative(MAP_RECT_HEIGHT);
    this.paintWidth = this.relative(this.width);
    this.paintHeight = this.relative(this.height);
  }

  /**
   * 设置map的缩放比例
   */
  setScale(scale: number): void {
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
  setToScale(scale: number): void {
    this.toScale = scale;
  }

  /**
   * 相对于地图scale的值
   * @param val
   * @returns {*}
   */
  relative(val: number): number {
    return val / this.scale;
  }

  /**
   * 清空画布
   */
  clear(): void {
    this.ctx.clearRect(0, 0, this.view.width, this.view.height);
  }

  /**
   * 对地图本身的更新都在此处进行
   */
  update(player: ViewTracker, callback: () => void): void {
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
    this.renderSmallMap();
  }

  /**
   * 限制element的位置
   */
  limit(element: { x: number, y: number, width?: number, height?: number }): void {
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
  render(): void {
    const view = this.view;
    this.ctx.save();
    const beginX = (view.x < 0) ? -view.x : (-view.x % this.paintBlockWidth);
    const beginY = (view.y < 0) ? -view.y : (-view.y % this.paintBlockHeight);
    const endX = (view.x + view.width > this.paintWidth)
      ? (this.paintWidth - view.x)
      : (beginX + view.width + this.paintBlockWidth);
    const endY = (view.y + view.height > this.paintHeight)
      ? (this.paintHeight - view.y)
      : (beginY + view.height + this.paintBlockHeight);

    // 铺底色
    this.ctx.fillStyle = '#999';
    this.ctx.fillRect(beginX, beginY, endX - beginX, endY - beginY);

    // 画方格砖
    this.ctx.lineWidth = 0.5;
    this.ctx.strokeStyle = '#fff';
    for (let x = beginX; x <= endX; x += this.paintBlockWidth) {
      for (let y = beginY; y <= endY; y += this.paintBlockHeight) {
        const cx = endX - x;
        const cy = endY - y;
        const w = cx < this.paintBlockWidth ? cx : this.paintBlockWidth;
        const h = cy < this.paintBlockHeight ? cy : this.paintBlockHeight;

        this.ctx.strokeRect(x, y, w, h);
      }
    }

    this.ctx.restore();
  }

  /**
   * 画小地图
   */
  renderSmallMap(): void {
    const view = this.view;

    // 小地图外壳, 圆圈
    const margin = 30;
    const smapr = 50;
    const smapx = view.width - smapr - margin;
    const smapy = view.height - smapr - margin;

    // 地图在小地图中的位置和大小
    const smrect = 50;
    const smrectw = this.paintWidth > this.paintHeight
      ? smrect
      : (this.paintWidth * smrect / this.paintHeight);
    const smrecth = this.paintWidth > this.paintHeight
      ? (this.paintHeight * smrect / this.paintWidth)
      : smrect;
    const smrectx = smapx - smrectw / 2;
    const smrecty = smapy - smrecth / 2;

    // 相对比例
    const radio = smrectw / this.paintWidth;

    // 视窗在小地图中的位置和大小
    const smviewx = view.x * radio + smrectx;
    const smviewy = view.y * radio + smrecty;
    const smvieww = view.width * radio;
    const smviewh = view.height * radio;

    this.ctx.save();
    this.ctx.globalAlpha = 0.8;

    // 画个圈先
    this.ctx.beginPath();
    this.ctx.arc(smapx, smapy, smapr, 0, Math.PI * 2);
    this.ctx.fillStyle = '#000';
    this.ctx.fill();
    this.ctx.stroke();

    // 画缩小版地图
    this.ctx.fillStyle = '#999';
    this.ctx.fillRect(smrectx, smrecty, smrectw, smrecth);

    // 画视窗
    this.ctx.strokeStyle = '#fff';
    this.ctx.strokeRect(smviewx, smviewy, smvieww, smviewh);

    this.ctx.restore();

    // 画蛇蛇位置
    // this.ctx.fillStyle = '#fff';
    // this.ctx.fillRect(smviewx + smvieww / 2 - 2, smviewy + smviewh / 2 - 2, 4, 4);
  }
}

// 视窗
class View {
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