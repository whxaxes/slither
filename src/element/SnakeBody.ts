import { SnakeBase, SnakeBaseOptions } from './SnakeBase';

// snake body必须有tracer
interface SnakeBodyOptions extends SnakeBase {
  tracer: SnakeBase;
}

export class SnakeBody extends SnakeBase {

  constructor(options: SnakeBodyOptions) {
    super(options);
  }

  move(): void {
    if (this.tracer && this.tracer.queue.length >= this.queueLen) {
      this.x = this.tracer.queue[0].x;
      this.y = this.tracer.queue[0].y;
    }
  }

  /**
   * 根据目标点, 计算速度
   */
  velocity(): void { }
}