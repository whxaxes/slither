/**
 * Created by wanghx on 5/3/16.
 *
 * Snake
 *
 */

import map from '../map';
import SnakeBody from './SnakeBody';
import SnakeHeader from './SnakeHeader';
import { SPEED } from '../constant';

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
    // 不让蛇走出边界, 也就是蛇头
    const whalf = this.header.width / 2;
    if (this.header.x < whalf) {
      this.header.x = whalf;
    } else if (this.header.x + whalf > map.width) {
      this.header.x = map.width - whalf;
    }

    const hhalf = this.header.height / 2;
    if (this.header.y < hhalf) {
      this.header.y = hhalf;
    } else if (this.header.y + hhalf > map.height) {
      this.header.y = map.height - hhalf;
    }

    // 渲染蛇头蛇身
    for (let i = this.bodys.length - 1; i >= 0; i--) {
      this.bodys[i].render();
    }

    this.header.render();
  }
}