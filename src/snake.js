/**
 * Created by wanghx on 4/23/16.
 *
 * snake
 *
 */
'use strict';

const SPEED = 1.8;

// 蛇头和蛇身的基类
class Base {
  constructor(options) {
    this.ctx = options.ctx;
    this.x = options.x;
    this.y = options.y;
    this.r = options.r;

    // 皮肤颜色
    this.color_1 = `rgba(${options.color.r},${options.color.g},${options.color.b},${options.color.a || 1})`;
    // 描边颜色
    this.color_2 = `#000`;

    this.vx = 0;
    this.vy = 0;
    this.tox = this.x;
    this.toy = this.y;

    // 生成元素图片镜像
    this.createImage();
  }

  /**
   * 生成图片镜像
   */
  createImage() {
    this.img = document.createElement('canvas');
    this.img.width = this.r * 2 + 10;
    this.img.height = this.r * 2 + 10;
    this.imgctx = this.img.getContext('2d');

    this.imgctx.lineWidth = 2;
    this.imgctx.save();
    this.imgctx.beginPath();
    this.imgctx.arc(this.img.width / 2, this.img.height / 2, this.r, 0, Math.PI * 2);
    this.imgctx.fillStyle = this.color_1;
    this.imgctx.strokeStyle = this.color_2;
    this.imgctx.stroke();
    this.imgctx.fill();
    this.imgctx.restore();
  }

  /**
   * 给予目标点, 计算速度
   * @param x
   * @param y
   */
  moveTo(x, y) {
    this.tox = x;
    this.toy = y;

    const dis_x = this.tox - this.x;
    const dis_y = this.toy - this.y;
    const dis = Math.sqrt(dis_x * dis_x + dis_y * dis_y);

    this.vy = dis_y * (SPEED / dis);
    this.vx = dis_x * (SPEED / dis);
  }

  /**
   * 更新位置
   */
  update() {
    this.x += this.vx;
    this.y += this.vy;
  }

  /**
   * 渲染镜像图片
   * @param nx 渲染的x位置, 可不传
   * @param ny 渲染的y位置, 可不传
   */
  render(nx, ny) {
    let x = nx === undefined ? this.x : nx;
    let y = ny === undefined ? this.y : ny;

    this.ctx.drawImage(
      this.img,
      x - this.img.width / 2,
      y - this.img.height / 2
    );
  }
}

// 蛇的身躯类
class Body extends Base {
  constructor(options) {
    super(options);

    this.aims = [];
  }

  // 身躯跟头部的运动轨迹不同, 身躯要走完当前目标后才进入下一个目标
  moveTo(x, y) {
    this.aims.push({x, y});

    if (this.tox == this.x && this.toy == this.y) {
      let naim = this.aims.shift();
      super.moveTo(naim.x, naim.y);
    }
  }

  update() {
    super.update();

    // 到达目的地设置x为目标x
    if (Math.abs(this.tox - this.x) <= SPEED) {
      this.x = this.tox;
    }

    // 到达目的地设置y为目标y
    if (Math.abs(this.toy - this.y) <= SPEED) {
      this.y = this.toy;
    }
  }
}

// 蛇头类
class Header extends Base {
  constructor(options) {
    super(options);

    this.vx = SPEED;
    this.aims = [];
    this.angle = 0;
  }

  /**
   * 添加画眼睛的功能
   */
  createImage() {
    super.createImage();
    const self = this;
    const eye_r = this.r * 3 / 7;

    // 画左眼
    drawEye(
      this.img.width / 2 + this.r - eye_r,
      this.img.height / 2 - this.r + eye_r
    );

    // 画右眼
    drawEye(
      this.img.width / 2 + this.r - eye_r,
      this.img.height / 2 + this.r - eye_r
    );

    function drawEye(eye_x, eye_y) {
      self.imgctx.beginPath();
      self.imgctx.fillStyle = '#fff';
      self.imgctx.strokeStyle = self.color_2;
      self.imgctx.arc(eye_x, eye_y, eye_r, 0, Math.PI * 2);
      self.imgctx.fill();
      self.imgctx.stroke();

      self.imgctx.beginPath();
      self.imgctx.fillStyle = '#000';
      self.imgctx.arc(eye_x + eye_r / 2, eye_y, 3, 0, Math.PI * 2);
      self.imgctx.fill();
    }
  }

  /**
   * 移动的同时, 还需要根据移动方向计算角度
   */
  moveTo(x, y) {
    if (!this.aims.length)
      return this.aims.push({x, y});

    const oldaim = this.aims[this.aims.length - 1];
    const dis_x = x - oldaim.x;
    const dis_y = y - oldaim.y;
    const dis = Math.sqrt(dis_x * dis_x + dis_y * dis_y);

    if (dis > 30) {
      const fen = ~~(dis / 30);
      for (let i = 1; i <= fen; i++) {
        if(this.aims.length > 10) this.aims.shift();

        this.aims.push({
          x: oldaim.x + dis_x * i/fen,
          y: oldaim.y + dis_y * i/fen
        });
      }
    } else {
      this.aims[this.aims.length - 1] = {x, y};
    }
  }

  update() {
    const time = new Date();

    if((!this.time || time - this.time > 50) && this.aims.length) {
      const aim = this.aims.shift();

      super.moveTo(aim.x, aim.y);

      // 调整头部的方向
      this.angle = Math.atan(this.vy / this.vx) + (this.vx < 0 ? Math.PI : 0);

      this.time = time;
    }

    super.update();
  }

  /**
   * 根据角度来绘制不同方向的蛇头
   */
  render() {
    const self = this;
    this.aims.forEach(function(aim){
      self.ctx.fillRect(aim.x - 1, aim.y - 1, 2, 2);
    });

    // 要旋转至相应角度
    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    this.ctx.rotate(this.angle);
    super.render(0, 0);
    this.ctx.restore();
  }
}

/**
 * 蛇类
 */
export default class Snake {
  constructor(options) {
    // 创建脑袋
    this.header = new Header(options);

    // 创建身躯
    this.bodys = [];
    let body_dis = options.r * 2 / 5;
    for (let i = 0; i < 40; i++) {
      options.x -= body_dis;
      options.r -= 0.2;

      this.bodys.push(new Body(options));
    }
  }

  /**
   * 蛇的移动就是头部的移动
   */
  moveTo(x, y) {
    this.header.moveTo(x, y);
  }

  render() {
    // 蛇的身躯沿着蛇头的运动轨迹运动
    for (let i = this.bodys.length - 1; i >= 0; i--) {
      let body = this.bodys[i];
      let front = this.bodys[i - 1] || this.header;

      body.moveTo(front.x, front.y);

      body.update();
      body.render();
    }

    this.header.update();
    this.header.render();
  }
}