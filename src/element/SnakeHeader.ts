import { BASE_ANGLE, SYNC_PER_FRAME } from 'common/config';
import { SnakeBase, SnakeBaseOptions } from './SnakeBase';

// control by player
export class SnakeHeader extends SnakeBase {
  private toAngle: number;

  constructor(options: SnakeBaseOptions) {
    super(options);

    this.toAngle = this.angle;
    this.velocity();
  }

  /**
   * move to new position
   */
  public moveTo(nx: number, ny: number): void {
    const x: number = nx - this.x;
    const y: number = this.y - ny;
    let angle: number = Math.atan(Math.abs(x / y));

    // calculate angle, value is 0-360
    if (x > 0 && y < 0) {
      angle = Math.PI - angle;
    } else if (x < 0 && y < 0) {
      angle = Math.PI + angle;
    } else if (x < 0 && y > 0) {
      angle = Math.PI * 2 - angle;
    }

    const oldAngle: number = Math.abs(this.toAngle % (Math.PI * 2));

    // number of turns
    let rounds: number = ~~(this.toAngle / (Math.PI * 2));

    this.toAngle = angle;

    if (oldAngle >= Math.PI * 3 / 2 && this.toAngle <= Math.PI / 2) {
      // move from fourth quadrant to first quadrant
      rounds++;
    } else if (oldAngle <= Math.PI / 2 && this.toAngle >= Math.PI * 3 / 2) {
      // move from first quadrant to fourth quadrant
      rounds--;
    }

    // calculate the real angle by rounds
    this.toAngle += rounds * Math.PI * 2;
  }

  /**
   * calculate horizontal speed and vertical speed by angle of snake header
   */
  public velocity(): void {
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

  public move() {
    this.turnAround();
    this.velocity();
    this.x += this.vx;
    this.y += this.vy;
  }

  /**
   * turn around
   */
  public turnAround(): void {
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

// control by server(the other player)
export class ServerSnakeHeader extends SnakeBase {
  private aimx: number;
  private aimy: number;

  public moveTo(nx: number, ny: number) {
    this.aimx = nx;
    this.aimy = ny;
    this.vx = (nx - this.x) / SYNC_PER_FRAME;
    this.vy = (ny - this.y) / SYNC_PER_FRAME;
    this.continue();
  }

  public move() {
    if (Math.abs(this.aimx - this.x) < 1) {
      this.x = this.aimx;
      this.y = this.aimy;
      this.stop();
    } else {
      this.x += this.vx;
      this.y += this.vy;
    }
  }
}
