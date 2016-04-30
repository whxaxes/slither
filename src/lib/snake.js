/**
 * Created by wanghx on 4/23/16.
 *
 * snake
 *
 */

import Base from './base';
import map from './map';

const SPEED = 3;
const BASE_ANGLE = Math.PI * 200; // 用于保证蛇的角度一直都是正数

// 蛇头和蛇身的基类
class SnakeBase extends Base {
  constructor(options) {
    super(options);

    // 皮肤颜色
    this.color = options.color;
    // 描边颜色
    this.color_2 = '#000';

    // 垂直和水平速度
    this.vx = SPEED;
    this.vy = 0;

    // 生成元素图片镜像
    this.createImage();
  }

  // 设置基类的速度
  set speed(val) {
    this._speed = val;

    // 重新计算水平垂直速度
    this.velocity();
  }

  get speed() {
    return this._speed
      ? this._speed
      : (this._speed = this.tracer ? this.tracer.speed : SPEED);
  }

  /**
   * 设置宽度和高度
   * @param width
   * @param height
   */
  setSize(width, height) {
    this.width = width;
    this.height = height || width;
    this.createImage();
  }

  /**
   * 生成图片镜像
   */
  createImage() {
    this.img = this.img || document.createElement('canvas');
    this.img.width = this.width + 10;
    this.img.height = this.height + 10;
    this.imgctx = this.img.getContext('2d');

    this.imgctx.lineWidth = 2;
    this.imgctx.save();
    this.imgctx.beginPath();
    this.imgctx.arc(this.img.width / 2, this.img.height / 2, this.width / 2, 0, Math.PI * 2);
    this.imgctx.fillStyle = this.color;
    this.imgctx.strokeStyle = this.color_2;
    this.imgctx.stroke();
    this.imgctx.fill();
    this.imgctx.restore();
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
    this.update();

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

    // 绘制移动方向, debug用
    //map.ctx.beginPath();
    //map.ctx.moveTo(
    //  this.paintX - (this.width * 0.5 * this.vx / this.speed),
    //  this.paintY - (this.width * 0.5 * this.vy / this.speed)
    //);
    //map.ctx.lineTo(this.paintX, this.paintY);
    //map.ctx.strokeStyle = '#000';
    //map.ctx.stroke();
  }
}

// 蛇的身躯类
class SnakeBody extends SnakeBase {
  constructor(options) {
    super(options);

    // 设置跟踪者
    this.tracer = options.tracer;

    this.tracerDis = this.distance;

    this.savex = this.tox = this.tracer.x - this.distance;
    this.savey = this.toy = this.tracer.y;
  }

  get distance() {
    return this.tracer.width * 0.2;
  }

  update() {
    if (this.tracerDis >= this.distance) {
      const tracer = this.tracer;

      // 计算位置的偏移量
      this.tox = this.savex + ((this.tracerDis - this.distance) * tracer.vx / tracer.speed);
      this.toy = this.savey + ((this.tracerDis - this.distance) * tracer.vy / tracer.speed);

      this.velocity(this.tox, this.toy);

      this.tracerDis = 0;

      // 保存tracer位置
      this.savex = this.tracer.x;
      this.savey = this.tracer.y;
    }

    this.tracerDis += this.tracer.speed;

    if (Math.abs(this.tox - this.x) <= Math.abs(this.vx)) {
      this.x = this.tox;
    } else {
      this.x += this.vx;
    }

    if (Math.abs(this.toy - this.y) <= Math.abs(this.vy)) {
      this.y = this.toy;
    } else {
      this.y += this.vy;
    }
  }

  /**
   * 根据目标点, 计算速度
   * @param x
   * @param y
   */
  velocity(x, y) {
    this.tox = x || this.tox;
    this.toy = y || this.toy;

    const disX = this.tox - this.x;
    const disY = this.toy - this.y;
    const dis = Math.hypot(disX, disY);

    this.vx = this.speed * disX / dis || 0;
    this.vy = this.speed * disY / dis || 0;
  }
}

// 蛇头类
class SnakeHeader extends SnakeBase {
  constructor(options) {
    super(options);

    this.angle = BASE_ANGLE + Math.PI / 2;
    this.toAngle = this.angle;
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
   * 转向某个角度
   */
  directTo(angle) {
    // 老的目标角度, 但是是小于360度的, 因为每次计算出来的目标角度也是0 - 360度
    const oldAngle = Math.abs(this.toAngle % (Math.PI * 2));

    // 转了多少圈
    let rounds = ~~(this.toAngle / (Math.PI * 2));

    this.toAngle = angle;

    if (oldAngle >= Math.PI * 3 / 2 && this.toAngle <= Math.PI / 2) {
      // 角度从第四象限左划至第一象限, 增加圈数
      rounds++;
    } else if (oldAngle <= Math.PI / 2 && this.toAngle >= Math.PI * 3 / 2) {
      // 角度从第一象限划至第四象限, 减少圈数
      rounds--;
    }

    // 计算真实要转到的角度
    this.toAngle += rounds * Math.PI * 2;
  }

  // 根据蛇头角度计算水平速度和垂直速度
  velocity() {
    const angle = this.angle % (Math.PI * 2);
    const vx = Math.abs(this.speed * Math.sin(angle));
    const vy = Math.abs(this.speed * Math.cos(angle));

    if (angle < Math.PI / 2) {
      this.vx = vx;
      this.vy = -vy;
    } else if (angle < Math.PI) {
      this.vx = vx;
      this.vy = vy;
    } else if (angle < Math.PI * 3 / 2) {
      this.vx = -vx;
      this.vy = vy;
    } else {
      this.vx = -vx;
      this.vy = -vy;
    }
  }

  /**
   * 增加蛇头的逐帧逻辑
   */
  update() {
    this.turnAround();

    this.velocity();

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
   * 蛇头转头
   */
  turnAround() {
    const angleDistance = this.toAngle - this.angle; // 与目标角度之间的角度差
    const turnSpeed = 0.045; // 转头速度

    // 当转到目标角度, 重置蛇头角度
    if (Math.abs(angleDistance) <= turnSpeed) {
      this.toAngle = this.angle = BASE_ANGLE + this.toAngle % (Math.PI * 2);
    } else {
      this.angle += Math.sign(angleDistance) * turnSpeed;
    }
  }
}


// 蛇类
export default class Snake {
  constructor(options) {
    this.bodys = [];
    this.point = 0;

    // 创建脑袋
    this.header = new SnakeHeader(options);

    // 创建身躯, 给予各个身躯跟踪目标
    options.tracer = this.header;
    for (let i = 0; i < options.length; i++) {
      this.bodys.push(options.tracer = new SnakeBody(options));
    }

    this.binding();
  }

  get x() {
    return this.header.x;
  }

  get y() {
    return this.header.y;
  }

  /**
   * 蛇与鼠标的交互事件
   */
  binding() {
    const header = this.header;
    const bodys = this.bodys;

    // 蛇头跟随鼠标的移动而变更移动方向
    window.addEventListener('mousemove', (e = window.event) => {
      const x = e.clientX - header.paintX;
      const y = header.paintY - e.clientY;
      let angle = Math.atan(Math.abs(x / y));

      // 计算角度, 角度值为 0-360
      if (x > 0 && y < 0) {
        angle = Math.PI - angle;
      } else if (x < 0 && y < 0) {
        angle = Math.PI + angle;
      } else if (x < 0 && y > 0) {
        angle = Math.PI * 2 - angle;
      }

      header.directTo(angle);
    });

    // 鼠标按下让蛇加速
    window.addEventListener('mousedown', () => {
      header.speed = 5;
      bodys.forEach(body => {
        body.speed = 5;
      });
    });

    // 鼠标抬起停止加速
    window.addEventListener('mouseup', () => {
      header.speed = SPEED;
      bodys.forEach(body => {
        body.speed = SPEED;
      });
    });
  }

  /**
   * 吃掉食物
   * @param food
   */
  eat(food) {
    this.point += food.point;

    // 增加分数引起虫子体积增大
    const newSize = this.header.width + food.point / 50;
    this.header.setSize(newSize);
    this.bodys.forEach(body => {
      body.setSize(newSize);
    });

    // 同时每吃一个食物, 都增加身躯
    const lastBody = this.bodys[this.bodys.length - 1];
    this.bodys.push(new SnakeBody({
      x: lastBody.x,
      y: lastBody.y,
      size: lastBody.width,
      color: lastBody.color,
      tracer: lastBody
    }));
  }

  // 渲染蛇头蛇身
  render() {
    for (let i = this.bodys.length - 1; i >= 0; i--) {
      this.bodys[i].render();
    }

    this.header.render();
  }
}