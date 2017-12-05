import { SPEED } from 'common/config';
import { GameMap } from '~/framework/GameMap';
import { ObserverInterface } from '~/framework/Observer';
import { getSnakeHeader } from '~/libs/imageStore';
import { gameMap } from '~/main';
import { Food } from './Food';
import { SnakeBaseOptions } from './SnakeBase';
import { SnakeBody } from './SnakeBody';
import { ServerSnakeHeader, SnakeHeader } from './SnakeHeader';

interface SnakeOptions extends SnakeBaseOptions {
  length?: number;
  fillColor?: string;
  strokeColor?: string;
}

export class Snake implements ObserverInterface {
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

    // create header instance
    const headerOptions: SnakeBaseOptions = {
      x: options.x,
      y: options.y,
      size: options.size,
      angle: options.angle,
      img: getSnakeHeader(imgWidth, imgHeight, fillColor, strokeColor),
    };

    if (this.serverControl) {
      this.header = new ServerSnakeHeader(headerOptions);
    } else {
      this.header = new SnakeHeader(headerOptions);
    }

    // create body instances
    for (let i = 0; i < options.length || 0; i++) {
      let { x, y } = options;
      if (this.serverControl && bodyCoords && bodyCoords.length) {
        x = bodyCoords[i * 2];
        y = bodyCoords[i * 2 + 1];
      }

      this.bodys.push(new SnakeBody({
        x, y,
        size: options.size,
        angle: options.angle,
        tracer: this.bodys[i - 1] || this.header,
      }));
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

    lastBody.follower = new SnakeBody({
      x: lastBody.x,
      y: lastBody.y,
      size: lastBody.width,
      tracer: lastBody,
      img: image,
    });

    this.bodys.push(lastBody.follower);
    return lastBody.follower;
  }

  /**
   * update status
   */
  public update(): void {
    // avoid moving to outside
    gameMap.limit(this.header);

    gameMap.ctx.save();
    gameMap.ctx.lineWidth = this.header.width;
    gameMap.ctx.lineCap = 'round';
    gameMap.ctx.lineJoin = 'round';
    gameMap.ctx.beginPath();
    gameMap.ctx.shadowColor = '#000';
    gameMap.ctx.shadowBlur = 9;
    gameMap.ctx.moveTo(
      this.header.paintX,
      this.header.paintY,
    );

    let i = 0;
    const len = this.bodys.length;
    while (i < len) {
      const body = this.bodys[i++];
      body.update();

      if (!body.visible)  {
        continue;
      }

      gameMap.ctx.lineTo(body.paintX, body.paintY);
    }

    gameMap.ctx.strokeStyle = this.fillColor;
    gameMap.ctx.stroke();
    gameMap.ctx.restore();

    this.header.update();
  }
}
