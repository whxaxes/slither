import { SnakeBase, SnakeBaseOptions } from './SnakeBase';

// snake body必须有tracer
interface SnakeBodyOptions extends SnakeBaseOptions {
  tracer: SnakeBase;
}

export class SnakeBody extends SnakeBase {
  constructor(options: SnakeBodyOptions) {
    super(options);
  }

  move(): void {
    if (this.tracer.movementQueue.length >= this.tracer.movementQueueLen) {
      this.updateMovement(
        this.tracer.movementQueue.shift()
      );
    }
  }

  /**
   * 根据目标点, 计算速度
   */
  velocity(): void { }
}