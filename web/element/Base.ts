import { gameMap } from '~/main';

export interface BaseOptions {
  x: number;
  y: number;
  size: number;
  width?: number;
  height?: number;
}

export abstract class Base {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public paintX: number;
  public paintY: number;
  public paintWidth: number;
  public paintHeight: number;
  public visible: boolean;

  constructor(options: BaseOptions) {
    this.x = +(options.x || 0);
    this.y = +(options.y || 0);
    this.width = options.size || options.width || 0;
    this.height = options.size || options.height || 0;

    if (!this.width || !this.height) {
      throw new Error('element size can not be undefined');
    }
  }

  /**
   * update status
   */
  public update(): void {
    this.prepare();
    this.action();
    this.render();
  }

  public abstract action(): void;

  public abstract render(): void;

  private prepare(): void {
    this.paintX = gameMap.view.relativeX(this.x);
    this.paintY = gameMap.view.relativeY(this.y);
    this.paintWidth = gameMap.view.relativeW(this.width);
    this.paintHeight = gameMap.view.relativeH(this.height);
    const halfWidth = this.paintWidth / 2;
    const halfHeight = this.paintHeight / 2;
    this.visible = (this.paintX + halfWidth > 0)
      && (this.paintX - halfWidth < gameMap.view.width)
      && (this.paintY + halfHeight > 0)
      && (this.paintY - halfHeight < gameMap.view.height);
  }
}
