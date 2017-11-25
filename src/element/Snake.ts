import { SPEED } from 'common/config';
import { GameMap } from '~/framework/GameMap';
import { ObserverInterface } from '~/framework/Observer';
import { Food } from './Food';
import { SnakeBaseOptions } from './SnakeBase';
import { SnakeBody } from './SnakeBody';
import { ServerSnakeHeader, SnakeHeader } from './SnakeHeader';

const snakeImageStore = {
  store: {},

  // 获取图片
  getImage(kind: number, ...args: Array<number | string>): HTMLCanvasElement {
    const key: string = args.concat(kind).join('_');

    if (this.store.hasOwnProperty(key)) {
      return this.store[key];
    }

    this.store[key] = this.createHeaderImg.apply(this, args);
    return this.store[key];
  },

  // create image of snake header
  createHeaderImg(width: number, height: number, fillColor: string, strokeColor: string): HTMLCanvasElement {
    const img: HTMLCanvasElement = document.createElement('canvas');
    const ctx: CanvasRenderingContext2D = img.getContext('2d');
    const dis: number = 2;

    img.width = width + dis * 2;
    img.height = height + dis * 2;

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
      img.height / 2 - height / 2 + eyeRadius,
    );

    // right eye
    drawEye(
      img.width / 2 + width / 2 - eyeRadius,
      img.height / 2 - height / 2 + eyeRadius,
    );

    return img;
  },
};

interface SnakeOptions extends SnakeBaseOptions {
  length?: number;
  fillColor?: string;
  strokeColor?: string;
}

export class Snake implements ObserverInterface {
  public gamemap: GameMap;
  public header: SnakeHeader | ServerSnakeHeader;
  public bodys: SnakeBody[] = [];
  public bodyImages: HTMLCanvasElement[] = [];
  public colorIndex: number = 0;
  public point: number = 0;
  public isSpeedUp: boolean = false;
  public fillColor: string = '';

  constructor(
    options: SnakeOptions,
    public serverControl: boolean,
    bodyCoords?: number[],
  ) {
    const imgWidth: number = 60;
    const imgHeight: number = 60;
    const strokeColor: string = options.strokeColor || '#000';
    const fillColor: string = options.fillColor || '#fff';
    this.fillColor = fillColor;

    this.gamemap = options.gamemap;

    // 创建蛇头实例
    const headerOptions: SnakeBaseOptions = Object.assign(options, {
      img: snakeImageStore.getImage(1, imgWidth, imgHeight, fillColor, strokeColor),
    });

    if (this.serverControl) {
      this.header = new ServerSnakeHeader(headerOptions);
    } else {
      this.header = new SnakeHeader(headerOptions);
    }

    // 创建身躯实例
    for (let i = 0; i < options.length || 0; i++) {
      if (this.serverControl && bodyCoords && bodyCoords.length) {
        options.x = bodyCoords[i * 2];
        options.y = bodyCoords[i * 2 + 1];
      }

      this.bodys.push(new SnakeBody(Object.assign(options, {
        tracer: this.bodys[i - 1] || this.header,
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
  public moveTo(nx: number, ny: number) {
    this.header.moveTo(nx, ny);
  }

  public speedUp(): void {
    if (this.isSpeedUp) {
      return;
    }

    this.isSpeedUp = true;
    this.header.speed *= 2;
  }

  public speedDown(): void {
    if (!this.isSpeedUp) {
      return;
    }

    this.isSpeedUp = false;
    this.header.speed /= 2;
  }

  public stop() {
    this.header.stop();
  }

  public continue() {
    this.header.continue();
  }

  public eat(food: Food) {
    this.point += food.point;

    // 增加分数引起虫子体积增大
    const added = food.point / 80;
    this.header.setSize(this.header.width + added);
    this.bodys.forEach((body) => { body.setSize(body.width + added); });

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
      img: image,
    });

    lastBody.follower = addedBody;
    this.bodys.push(addedBody);
    return added;
  }

  /**
   * 更新状态
   */
  public update(): void {
    // 不让蛇走出地图外
    this.gamemap.limit(this.header);

    const ctx = this.gamemap.ctx;
    ctx.save();
    ctx.lineWidth = this.header.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 9;

    ctx.moveTo(
      this.header.paintX,
      this.header.paintY,
    );

    let i = 0;
    const len = this.bodys.length;
    while (i < len) {
      const body = this.bodys[i];
      body.update(false, true);
      if (!body.visible) { continue; }
      ctx.lineTo(body.paintX, body.paintY);
      i++;
    }

    ctx.strokeStyle = this.fillColor;
    ctx.stroke();
    ctx.restore();

    this.header.update();
  }
}
