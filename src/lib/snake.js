/**
 * Created by wanghx on 4/23/16.
 *
 * snake
 *
 */

import Base from './base';
import map from './map';

const BASE_ANGLE = Math.PI * 200; // 用于保证蛇的角度一直都是正数

// 蛇头和蛇身的基类
class SnakeBase extends Base {
  constructor(options) {
    super(options);

    this.speed = options.speed;
    this.aims = [];

    // 皮肤颜色
    this.color_1 = options.color;
    // 描边颜色
    this.color_2 = '#000';

    // 垂直和水平速度
    this.vx = 0;
    this.vy = 0;

    // 目标地址
    this.tox = this.x;
    this.toy = this.y;

    // 生成元素图片镜像
    this.createImage();
  }

  // 设置基类的速度
  set speed(val) {
    const a = val - this._speed;
    const b = Math.abs(this.vx) + Math.abs(this.vy);

    this._speed = val;

    if (!a) return;

    // 更新速度
    this.vx += a * this.vx / b;
    this.vy += a * this.vy / b;
  }

  get speed() {
    return this._speed;
  }

  /**
   * 生成图片镜像
   */
  createImage() {
    this.img = document.createElement('canvas');
    this.img.width = this.width + 10;
    this.img.height = this.height + 10;
    this.imgctx = this.img.getContext('2d');

    this.imgctx.lineWidth = 2;
    this.imgctx.save();
    this.imgctx.beginPath();
    this.imgctx.arc(this.img.width / 2, this.img.height / 2, this.width / 2, 0, Math.PI * 2);
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
  velocity(x, y) {
    this.tox = x;
    this.toy = y;

    const disX = this.tox - this.x;
    const disY = this.toy - this.y;
    const dis = Math.hypot(disX, disY);

    this.vy = disY * (this.speed / dis) || 0;
    this.vx = disX * (this.speed / dis) || 0;
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
   */
  render() {
    // 如果该元素在视窗内不可见, 则不进行绘制
    if (!this.visible) return;

    // 如果该对象有角度属性, 则使用translate来绘制, 因为要旋转
    if (this.hasOwnProperty('angle')) {
      map.ctx.save();
      map.ctx.translate(this.paintX, this.paintY);
      map.ctx.rotate(this.angle - BASE_ANGLE - Math.PI / 2);
      map.ctx.drawImage(this.img, -this.img.width / 2, -this.img.height / 2);
      map.ctx.restore();
    } else {
      map.ctx.drawImage(
        this.img,
        this.paintX - this.img.width / 2,
        this.paintY - this.img.height / 2
      );
    }
  }
}

// 蛇的身躯类
class Body extends SnakeBase {

  // 身躯跟头部的运动轨迹不同, 身躯要走完当前目标后才进入下一个目标
  moveTo(x, y) {
    this.aims.push({ x, y });

    if (this.tox === this.x && this.toy === this.y) {
      const aim = this.aims.shift();
      this.velocity(aim.x, aim.y);
    }
  }

  update() {
    super.update();

    // 到达目的地设置x为目标x
    if (Math.abs(this.tox - this.x) <= this.speed) {
      this.x = this.tox;
    }

    // 到达目的地设置y为目标y
    if (Math.abs(this.toy - this.y) <= this.speed) {
      this.y = this.toy;
    }
  }
}

// 蛇头类
class Header extends SnakeBase {
  constructor(options) {
    super(options);

    this.vx = this.speed;
    this.angle = BASE_ANGLE + Math.PI / 2;
    this.toa = this.angle;
  }

  /**
   * 添加画眼睛的功能
   */
  createImage() {
    super.createImage();
    const self = this;
    const eyeRadius = this.width * 0.2;

    function drawEye(eyeX, eyeY) {
      self.imgctx.beginPath();
      self.imgctx.fillStyle = '#fff';
      self.imgctx.strokeStyle = self.color_2;
      self.imgctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
      self.imgctx.fill();
      self.imgctx.stroke();

      self.imgctx.beginPath();
      self.imgctx.fillStyle = '#000';
      self.imgctx.arc(eyeX + eyeRadius / 2, eyeY, 3, 0, Math.PI * 2);
      self.imgctx.fill();
    }

    // 画左眼
    drawEye(
      this.img.width / 2 + this.width / 2 - eyeRadius,
      this.img.height / 2 - this.height / 2 + eyeRadius
    );

    // 画右眼
    drawEye(
      this.img.width / 2 + this.width / 2 - eyeRadius,
      this.img.height / 2 + this.height / 2 - eyeRadius
    );
  }

  /**
   * 这里不进行真正的移动, 而是计算移动位置与目前位置的补间位置, 目的是为了让蛇的转弯不那么突兀
   */
  moveTo(x, y) {
    if (!this.aims.length) {
      return this.aims.push({ x, y });
    }

    const olderAim = this.aims[this.aims.length - 1];
    const disX = x - olderAim.x;
    const disY = y - olderAim.y;
    const dis = Math.hypot(disX, disY);
    const min = 20;

    if (dis > min) {
      const part = ~~(dis / min);
      for (let i = 1; i <= part; i++) {
        // 记录的目标点不超过20个
        if (this.aims.length > 30) {
          this.aims.shift();
        }

        this.aims.push({
          x: olderAim.x + disX * i / part,
          y: olderAim.y + disY * i / part
        });
      }
    } else {
      this.aims[this.aims.length - 1] = { x, y };
    }
  }

  /**
   * 增加蛇头的逐帧逻辑
   */
  update() {
    const time = new Date();

    // 每隔一段时间获取一次目标位置集合中的数据, 进行移动
    if ((!this.time || time - this.time > 30) && this.aims.length) {
      const aim = this.aims.shift();

      // 计算蛇头速度, 让蛇头朝目标移动
      this.velocity(aim.x, aim.y);

      // 根据新的目标位置, 更新toa
      this.turnTo();

      this.time = time;
    }

    // 让蛇转头
    this.turnAround();

    super.update();

    // 不让蛇走出边界
    const whalf = this.width / 2;
    if (this.x < whalf) {
      this.x = whalf;
    } else if (this.x + whalf > map.width) {
      this.x = map.width - whalf;
    }

    const hhalf = this.height / 2;
    if (this.y < hhalf) {
      this.y = hhalf;
    } else if (this.y + hhalf > map.height) {
      this.y = map.height - hhalf;
    }
  }

  /**
   * 根据蛇的目的地, 调整蛇头的目标角度
   */
  turnTo() {
    const olda = Math.abs(this.toa % (Math.PI * 2));// 老的目标角度, 但是是小于360度的, 因为每次计算出来的目标角度也是0 - 360度
    let rounds = ~~(this.toa / (Math.PI * 2));      // 转了多少圈
    this.toa = Math.atan(this.vy / this.vx) + (this.vx < 0 ? Math.PI : 0) + Math.PI / 2; // 目标角度

    if (olda >= Math.PI * 3 / 2 && this.toa <= Math.PI / 2) {
      // 角度从第一象限左划至第四象限, 增加圈数
      rounds++;
    } else if (olda <= Math.PI / 2 && this.toa >= Math.PI * 3 / 2) {
      // 角度从第四象限划至第一象限, 减少圈数
      rounds--;
    }

    // 计算真实要转到的角度
    this.toa += rounds * Math.PI * 2;
  }

  /**
   * 让蛇头转角更加平滑, 渐增转头
   */
  turnAround() {
    const angleDistance = this.toa - this.angle;

    if (angleDistance) {
      this.angle += angleDistance * 0.2;

      // 当转到目标角度, 重置蛇头角度
      if (Math.abs(angleDistance) <= 0.01) {
        this.toa = this.angle = BASE_ANGLE + this.toa % (Math.PI * 2);
      }
    }
  }
}

/**
 * 蛇类
 */
export default class Snake {
  constructor(options) {
    options.speed = 3;

    this.length = options.length; // 蛇的长度

    // 创建脑袋
    this.header = new Header(options);

    // 创建身躯
    this.bodys = [];
    this.body_dis = this.header.width * 0.3;
    for (let i = 0; i < this.length; i++) {
      options.x -= this.body_dis;

      this.bodys.push(new Body(options));
    }
  }

  get x() {
    return this.header.x;
  }

  get y() {
    return this.header.y;
  }

  // 加速
  speedUp() {
    this.speedRecord = this.header.speed;
    this.header.speed = 5;
    this.bodys.forEach(b => {
      b.speed = this.header.speed;
    });
  }

  // 减速
  speedDown() {
    this.header.speed = this.speedRecord;
    this.bodys.forEach(b => {
      b.speed = this.header.speed;
    });
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
      const body = this.bodys[i];
      const front = this.bodys[i - 1] || this.header;

      body.moveTo(front.x, front.y);
      body.update();

      // let disX = front.x - body.x;
      // let disY = front.y - body.y;
      // let dis = Math.hypot(disX, disY);
      // let radio = (dis - this.body_dis) / dis;
      // body.x += disX * radio;
      // body.y += disY * radio;

      body.render();
    }

    this.header.update();
    this.header.render();
  }
}