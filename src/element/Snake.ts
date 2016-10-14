import { SnakeBaseOptions } from './SnakeBase';
import { SnakeBody } from './SnakeBody';
import { SnakeHeader } from './SnakeHeader';
import { SPEED } from '../../common/config';
import { GameMap } from '../framework/GameMap';
import { ObserverInterface } from '../framework/Observer';

const snakeImageStore = {
  store: {},

  // 获取图片
  getImage(kind: number, ...args: Array<number | string>): HTMLCanvasElement {
    const key: string = args.concat(kind).join('_');

    if (this.store.hasOwnProperty(key)) {
      return this.store[key];
    }

    this.store[key] = (kind === 0) ?
      this.createBodyImg.apply(this, args) :
      this.createHeaderImg.apply(this, args);

    return this.store[key];
  },

  // 创建身躯图片
  createBodyImg(width: number, height: number, fillColor: string, strokeColor: string): HTMLCanvasElement {
    const img: HTMLCanvasElement = document.createElement('canvas');
    const ctx: CanvasRenderingContext2D = img.getContext('2d');
    const dis: number = 2;

    img.width = width + dis * 2;
    img.height = height + dis * 2;

    // draw a circle
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(img.width / 2, img.height / 2, width / 2, 0, Math.PI * 2);
    ctx.fillStyle = fillColor;
    // ctx.strokeStyle = strokeColor;
    // ctx.stroke();
    ctx.fill();

    // draw line on snake's back
    ctx.beginPath();
    ctx.moveTo(img.width / 2, img.height - dis);
    ctx.lineTo(img.width / 2, (img.height - dis + img.height / 2) / 2);
    ctx.strokeStyle = strokeColor;
    ctx.stroke();

    return img;
  },

  // 创建头部图片
  createHeaderImg(width: number, height: number, fillColor: string, strokeColor: string): HTMLCanvasElement {
    const img: HTMLCanvasElement = this.createBodyImg(
      width,
      height,
      fillColor,
      strokeColor
    );
    const ctx: CanvasRenderingContext2D = img.getContext('2d');
    const eyeRadius: number = width * 0.2;

    function drawEye(eyeX: number, eyeY: number): void {
      ctx.beginPath();
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = strokeColor;
      ctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // eyehole
      ctx.beginPath();
      ctx.fillStyle = '#000';
      ctx.arc(eyeX, eyeY - eyeRadius / 2, eyeRadius / 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // left eye
    drawEye(
      img.width / 2 - width / 2 + eyeRadius,
      img.height / 2 - height / 2 + eyeRadius
    );

    // right eye
    drawEye(
      img.width / 2 + width / 2 - eyeRadius,
      img.height / 2 - height / 2 + eyeRadius
    );

    return img;
  }
};

interface SnakeOptions extends SnakeBaseOptions {
  length?: number;
  fillColor?: string | Array<string>;
  strokeColor?: string;
}

export class Snake implements ObserverInterface {
  gamemap: GameMap;
  header: SnakeHeader;
  bodys: Array<SnakeBody> = [];
  point: number = 0;

  constructor(
    options: SnakeOptions,
    public isCustom: boolean
  ) {
    const imgWidth: number = 60;
    const imgHeight: number = 60;
    const strokeColor: string = options.strokeColor || '#000';
    const fillColor: string | Array<string> = options.fillColor || '#fff';
    const fillColors: Array<string> = (fillColor instanceof Array) ? fillColor : [fillColor];

    this.gamemap = options.gamemap;

    // 创建蛇头实例
    this.header = new SnakeHeader(Object.assign(options, {
      img: snakeImageStore.getImage(1, imgWidth, imgHeight, fillColors[0], strokeColor)
    }));

    // 创建身躯实例，生成花纹
    const bodyImages: Array<HTMLCanvasElement> = fillColors.map(color => {
      return snakeImageStore.getImage(0, imgWidth, imgHeight, color, strokeColor);
    });
    const len: number = bodyImages.length;
    let cindex: number = 0;
    let image: HTMLCanvasElement;
    for (let i = 0; i < options.length || 0; i++) {
      if (!image || (i + 1) % 5 === 0) {
        image = bodyImages[cindex % len];
        cindex++;
      }

      this.bodys.push(new SnakeBody(Object.assign(options, {
        tracer: this.bodys[i - 1] || this.header,
        img: image
      })));
    }

    // 设置蛇头与蛇躯的关联
    this.header.follower = this.bodys[0];
    this.bodys.forEach((body, i) => {
      body.follower = this.bodys[i + 1];
    });
  }

  get x(): number {
    return this.header.x;
  }

  get y(): number {
    return this.header.y;
  }

  /**
   * 往坐标点移动
   */
  moveTo(nx: number, ny: number) {
    const x: number = nx - this.header.x;
    const y: number = this.header.y - ny;
    let angle: number = Math.atan(Math.abs(x / y));

    // 计算角度, 角度值为 0-360
    if (x > 0 && y < 0) {
      angle = Math.PI - angle;
    } else if (x < 0 && y < 0) {
      angle = Math.PI + angle;
    } else if (x < 0 && y > 0) {
      angle = Math.PI * 2 - angle;
    }

    this.header.directTo(angle);
  }

  /**加速 */
  speedUp(): void {
    const newSpeed: number = SPEED * 2;
    this.header.speed = newSpeed;
    this.bodys.forEach(body => {
      body.speed = newSpeed;
    });
  }

  /**减速 */
  speedDown(): void {
    this.header.speed = SPEED;
    this.bodys.forEach(body => {
      body.speed = SPEED;
    });
  }

  /**
   * 更新状态
   */
  update(): void {
    // 不让蛇走出地图外
    this.gamemap.limit(this.header);

    // 渲染蛇头蛇身
    for (let i = this.bodys.length - 1; i >= 0; i--) {
      this.bodys[i].update();
    }

    this.header.update();
  }
}