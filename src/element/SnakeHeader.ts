import { SnakeBase, SnakeBaseOptions } from './SnakeBase';
import { BASE_ANGLE } from '../../common/config';

export class SnakeHeader extends SnakeBase {
  private toAngle: number;

  constructor(options: SnakeBaseOptions) {
    super(options);

    this.toAngle = this.angle;
  }

  /**
   * 转向某个角度
   */
  directTo(angle: number): void {
    // 老的目标角度, 但是是小于360度的, 因为每次计算出来的目标角度也是0 - 360度
    const oldAngle: number = Math.abs(this.toAngle % (Math.PI * 2));

    // 转了多少圈
    let rounds: number = ~~(this.toAngle / (Math.PI * 2));

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

  /**
   * 根据蛇头角度计算水平速度和垂直速度
   */
  velocity(): void {
    const angle: number = this.angle % (Math.PI * 2);
    const vx: number = Math.abs(this.speed * Math.sin(angle));
    const vy: number = Math.abs(this.speed * Math.cos(angle));

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

  move() {
    this.turnAround();
    this.velocity();
    this.x += this.vx;
    this.y += this.vy;
  }

  /**
  * 蛇头转头
  */
  turnAround(): void {
    const angleDistance: number = this.toAngle - this.angle; // 与目标角度之间的角度差
    const turnSpeed: number = 0.045; // 转头速度

    // 当转到目标角度, 重置蛇头角度
    if (Math.abs(angleDistance) <= turnSpeed) {
      this.toAngle = this.angle = BASE_ANGLE + this.toAngle % (Math.PI * 2);
    } else {
      this.angle += Math.sign(angleDistance) * turnSpeed;
    }
  }
}