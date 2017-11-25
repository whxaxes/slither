import { SnakeBase, SnakeBaseOptions } from './SnakeBase';

// snake body must has tracer
interface SnakeBodyOptions extends SnakeBaseOptions {
  tracer: SnakeBase;
}

export class SnakeBody extends SnakeBase {
  constructor(options: SnakeBodyOptions) {
    super(options);
  }

  public move(): void {
    if (this.tracer && this.tracer.movementQueue.length >= this.tracer.movementQueueLen) {
      const movement = this.tracer.movementQueue.shift();
      Object.keys(movement).forEach(
        (key) => this[key] = movement[key],
      );
    }
  }
}
