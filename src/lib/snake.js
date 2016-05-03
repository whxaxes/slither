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

    // 垂直和水平速度
    this.vx = SPEED;
    this.vy = 0;

    // 添加贴图
    this.img = options.img;
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
      map.ctx.drawImage(
        this.img,
        -this.paintWidth / 2,
        -this.paintHeight / 2,
        this.paintWidth,
        this.paintHeight
      );
      map.ctx.restore();
    } else {
      map.ctx.drawImage(
        this.img,
        this.paintX - this.paintWidth / 2,
        this.paintY - this.paintHeight / 2,
        this.paintWidth,
        this.paintHeight
      );
    }

    // 绘制移动方向, debug用
    //    map.ctx.beginPath();
    //    map.ctx.moveTo(
    //      this.paintX - (this.paintWidth * 0.5 * this.vx / this.speed),
    //      this.paintY - (this.paintWidth * 0.5 * this.vy / this.speed)
    //    );
    //    map.ctx.lineTo(this.paintX, this.paintY);
    //    map.ctx.strokeStyle = '#000';
    //    map.ctx.stroke();
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

    // 皮肤颜色
    this.color = options.color || '#fff';

    // 描边颜色
    this.color_2 = '#000';

    // 蛇头图层
    this.headerImage = document.createElement('canvas');

    // 蛇身图层
    this.bodyImage = document.createElement('canvas');

    // 初始化
    this.init(options);
  }

  get x() {
    return this.header.x;
  }

  get y() {
    return this.header.y;
  }

  /**
   * 初始化蛇实例
   * @param options
   */
  init(options) {
    // 创建脑袋
    this.header = new SnakeHeader(Object.assign(options, {
      img: this.headerImage
    }));

    // 创建身躯, 给予各个身躯跟踪目标
    for (let i = 0; i < options.length; i++) {
      this.bodys.push(new SnakeBody(Object.assign(options, {
        tracer: this.bodys[i - 1] || this.header,
        img: this.bodyImage
      })));
    }

    // 更新图层
    this.updateImage();

    // 事件绑定
    this.binding();
  }

  /**
   * 更新图层
   */
  updateImage() {
    // 更新蛇身的图层
    this.updateBodyImage();

    // 更新蛇身的图层
    this.updateHeaderImage();
  }

  /**
   * 更新蛇身贴图
   */
  updateBodyImage() {
    const img = this.bodyImage;
    const body = this.bodys[0];
    const imgctx = img.getContext('2d');

    if (!body) return;

    this.drawMain(imgctx, img, body.paintWidth, body.paintHeight);
  }

  /**
   * 更新蛇头贴图
   */
  updateHeaderImage() {
    const img = this.headerImage;
    const header = this.header;
    const imgctx = img.getContext('2d');
    const eyeRadius = header.paintWidth * 0.2;

    this.drawMain(imgctx, img, header.paintWidth, header.paintHeight);

    // 画左眼
    this.drawEye(
      imgctx,
      img.width / 2 + header.paintWidth / 2 - eyeRadius,
      img.height / 2 - header.paintHeight / 2 + eyeRadius,
      eyeRadius
    );

    // 画右眼
    this.drawEye(
      imgctx,
      img.width / 2 + header.paintWidth / 2 - eyeRadius,
      img.height / 2 + header.paintHeight / 2 - eyeRadius,
      eyeRadius
    );
  }

  /**
   * 绘制主体
   */
  drawMain(ctx, img, width, height) {
    img.width = width + 4;
    img.height = height + 4;

    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(img.width / 2, img.height / 2, width / 2, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color_2;
    ctx.stroke();
    ctx.fill();
  }

  /**
   * 绘制眼睛的封装
   */
  drawEye(ctx, eyeX, eyeY, eyeRadius) {
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = this.color_2;
    ctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = '#000';
    ctx.arc(eyeX + eyeRadius / 2, eyeY, eyeRadius / 4, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * 蛇与鼠标的交互事件
   */
  binding() {
    const self = this;

    // 监听地图缩放变化, 更新贴图大小
    map.on('scale_changed', () => {
      self.updateImage();
    });

    // 鼠标/手指 跟蛇运动的交互事件绑定
    if (navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i)) {
      window.addEventListener('touchmove', e => {
        e.preventDefault();
        self.moveTo(e.touches[0].pageX, e.touches[0].pageY);
      });

      window.addEventListener('touchstart', e => {
        e.preventDefault();
        self.moveTo(e.touches[0].pageX, e.touches[0].pageY);
      });
    } else {
      // 蛇头跟随鼠标的移动而变更移动方向
      window.addEventListener('mousemove', (e = window.event) =>
        self.moveTo(e.clientX, e.clientY)
      );

      // 鼠标按下让蛇加速
      window.addEventListener('mousedown', self.speedUp.bind(self));

      // 鼠标抬起停止加速
      window.addEventListener('mouseup', self.speedDown.bind(self));
    }
  }

  /**
   * 加速
   */
  speedUp() {
    this.header.speed = 5;
    this.bodys.forEach(body => {
      body.speed = 5;
    });
  }

  /**
   * 恢复原速度
   */
  speedDown() {
    this.header.speed = SPEED;
    this.bodys.forEach(body => {
      body.speed = SPEED;
    });
  }

  /**
   * 根据传入坐标, 获取坐标点相对于蛇的角度
   * @param nx
   * @param ny
   */
  moveTo(nx, ny) {
    const x = nx - this.header.paintX;
    const y = this.header.paintY - ny;
    let angle = Math.atan(Math.abs(x / y));

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

  /**
   * 吃掉食物
   * @param food
   */
  eat(food) {
    this.foodNum = this.foodNum || 0;
    this.point += food.point;
    this.foodNum++;

    // 增加分数引起虫子体积增大
    const added = food.point / 100;
    this.header.setSize(this.header.width + added);
    this.bodys.forEach(body => { body.setSize(body.width + added); });

    // 调整地图缩放比例, 调整缩放比例的时候会更新图层, 所以不再次更新
    map.setScale(map.scale + added / (this.header.width * 3));

    // 每吃两个个食物, 都增加一截身躯
    if (this.foodNum % 2 === 0) {
      const lastBody = this.bodys[this.bodys.length - 1];
      this.bodys.push(new SnakeBody({
        x: lastBody.x,
        y: lastBody.y,
        size: lastBody.width,
        color: lastBody.color,
        tracer: lastBody,
        img: this.bodyImage
      }));
    }
  }

  // 渲染蛇头蛇身
  render() {
    for (let i = this.bodys.length - 1; i >= 0; i--) {
      this.bodys[i].render();
    }

    this.header.render();
  }
}