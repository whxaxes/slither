import { SnakeBaseOptions } from './SnakeBase';
import { SnakeBody } from './SnakeBody';
import { SnakeHeader, ServerSnakeHeader } from './SnakeHeader';
import { Food } from './Food';
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

    ctx.save();
    // draw a circle
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(img.width / 2, img.height / 2, width / 2, 0, Math.PI * 2);
    ctx.fillStyle = fillColor;
    // ctx.strokeStyle = strokeColor;
    // ctx.stroke();
    ctx.fill();

    // draw line on snake's back
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(img.width / 2, img.height - dis);
    ctx.lineTo(img.width / 2, (img.height - dis + img.height / 2) / 2);
    ctx.strokeStyle = strokeColor;
    ctx.stroke();

    ctx.restore();

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
  header: SnakeHeader | ServerSnakeHeader;
  bodys: Array<SnakeBody> = [];
  bodyImages: Array<HTMLCanvasElement> = [];
  colorIndex: number = 0;
  point: number = 0;
  isSpeedUp: boolean = false;

  constructor(
    options: SnakeOptions,
    public serverControl: boolean,
    bodyCoords?: Array<number>
  ) {
    const imgWidth: number = 60;
    const imgHeight: number = 60;
    const strokeColor: string = options.strokeColor || '#000';
    const fillColor: string | Array<string> = options.fillColor || '#fff';
    const fillColors: Array<string> = (fillColor instanceof Array) ? fillColor : [fillColor];

    this.gamemap = options.gamemap;

    // 创建蛇头实例
    const headerOptions: SnakeBaseOptions = Object.assign(options, {
      img: snakeImageStore.getImage(1, imgWidth, imgHeight, fillColors[0], strokeColor)
    });

    if (this.serverControl) {
      this.header = new ServerSnakeHeader(headerOptions);
    } else {
      this.header = new SnakeHeader(headerOptions);
    }

    // 创建身躯实例，生成花纹
    this.bodyImages = fillColors.map(color => {
      return snakeImageStore.getImage(0, imgWidth, imgHeight, color, strokeColor);
    });
    let image: HTMLCanvasElement;
    let body: SnakeBody;
    for (let i = 0; i < options.length || 0; i++) {
      if (!image || (i + 1) % 5 === 0) {
        image = this.bodyImages[this.colorIndex % this.bodyImages.length];
        this.colorIndex++;
      }

      if (this.serverControl && bodyCoords && bodyCoords.length) {
        options.x = bodyCoords[i * 2];
        options.y = bodyCoords[i * 2 + 1];
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
    this.header.moveTo(nx, ny);
  }

  speedUp(): void {
    this.isSpeedUp = true;
  }

  speedDown(): void {
    this.isSpeedUp = false;
  }

  stop() {
    this.header.stop();
  }

  continue() {
    this.header.continue();
  }

  eat(food: Food) {
    this.point += food.point;

    // 增加分数引起虫子体积增大
    const added = food.point / 80;
    this.header.setSize(this.header.width + added);
    this.bodys.forEach(body => { body.setSize(body.width + added); });

    const lastBody = this.bodys[this.bodys.length - 1];
    let image: HTMLCanvasElement = lastBody.img;
    if ((this.bodys.length + 1) % 5 === 0) {
      image = this.bodyImages[this.colorIndex % this.bodyImages.length];
      this.colorIndex++;
    }

    const addedBody = new SnakeBody({
      gamemap: lastBody.gamemap,
      x: lastBody.x,
      y: lastBody.y,
      size: lastBody.width,
      tracer: lastBody,
      img: image
    });

    lastBody.follower = addedBody;
    this.bodys.push(addedBody);
    return added;
  }

  /**
   * 更新状态
   */
  update(): void {
    // 不让蛇走出地图外
    this.gamemap.limit(this.header);

    // // 通过update两次来达到加速效果
    // if (this.isSpeedUp) {
    //   for (let i = this.bodys.length - 1; i >= 0; i--) {
    //     this.bodys[i].update();
    //   }

    //   this.header.update();
    // }

    // 渲染蛇头蛇身
    for (let i = this.bodys.length - 1; i >= 0; i--) {
      this.bodys[i].update();
      this.bodys[i].render();
    }

    this.header.update();
    this.header.render();
  }
}