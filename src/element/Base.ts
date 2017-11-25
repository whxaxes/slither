import { GameMap } from '~/framework/GameMap';

export interface BaseOptions {
  gamemap: GameMap;
  x: number;
  y: number;
  size?: number;
  width?: number;
  height?: number;
}

export abstract class Base {
  public gamemap: GameMap;
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
    this.gamemap = options.gamemap;
    this.x = +(options.x || 0);
    this.y = +(options.y || 0);
    this.width = options.size || options.width || 1;
    this.height = options.size || options.height || 1;
  }

  /**
   * 基础元素在地图中的更新
   * @params withoutAction 是否要进行逻辑更新
   * @params withoutRender 是否要进行渲染
   */
  public update(withoutAction?: boolean, withoutRender?: boolean): void {
    this.prepare();

    if (!withoutAction) {
      this.action();
    }

    if (!withoutRender) {
      this.render();
    }
  }

  public abstract action(): void;

  public abstract render(): void;

  private prepare(): void {
    this.paintX = this.gamemap.view.relativeX(this.x);
    this.paintY = this.gamemap.view.relativeY(this.y);
    this.paintWidth = this.gamemap.view.relativeW(this.width);
    this.paintHeight = this.gamemap.view.relativeH(this.height);
    const halfWidth = this.paintWidth / 2;
    const halfHeight = this.paintHeight / 2;
    this.visible = (this.paintX + halfWidth > 0)
      && (this.paintX - halfWidth < this.gamemap.view.width)
      && (this.paintY + halfHeight > 0)
      && (this.paintY - halfHeight < this.gamemap.view.height);
  }
}
