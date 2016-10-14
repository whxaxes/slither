/**
 * Created by wanghx on 4/27/16.
 *
 * base    地图上的元素基础类, 默认为圆
 *
 */

import { GameMap } from '../framework/GameMap';

export interface BaseOptions {
  gamemap: GameMap;
  x: number;
  y: number;
  size?: number;
  width?: number;
  height?: number;
}

export abstract class Base {
  gamemap: GameMap;
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(options: BaseOptions) {
    this.gamemap = options.gamemap;
    this.x = +(options.x || 0);
    this.y = +(options.y || 0);
    this.width = options.size || options.width || 1;
    this.height = options.size || options.height || 1;
  }

  /**
   * 绘制时的x坐标, 要根据视窗来计算位置
   */
  get paintX(): number {
    return this.gamemap.relative(this.x) - this.gamemap.view.x;
  }

  /**
   * 绘制时的y坐标, 要根据视窗来计算位置
   */
  get paintY(): number {
    return this.gamemap.relative(this.y) - this.gamemap.view.y;
  }

  /**
   * 绘制宽度
   */
  get paintWidth(): number {
    return this.gamemap.relative(this.width);
  }

  /**
   * 绘制高度
   */
  get paintHeight(): number {
    return this.gamemap.relative(this.height);
  }

  /**
   * 在视窗内是否可见
   */
  get visible(): boolean {
    const paintX = this.paintX;
    const paintY = this.paintY;
    const halfWidth = this.paintWidth / 2;
    const halfHeight = this.paintHeight / 2;

    return (paintX + halfWidth > 0)
      && (paintX - halfWidth < this.gamemap.view.width)
      && (paintY + halfHeight > 0)
      && (paintY - halfHeight < this.gamemap.view.height);
  }

  abstract update(): void;

  abstract render(): void;
}