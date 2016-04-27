/**
 * Created by wanghx on 4/27/16.
 *
 * base    地图上的元素基础类, 默认为圆
 *
 * 基础属性:
 *  - x       元素的中心点x坐标
 *  - y       元素的中心店y坐标
 *  - width   元素宽度
 *  - height  元素高度
 *  - paintX  元素的绘制坐标,
 *  - paintY  元素的绘制坐标
 *  - visible 元素是否在视窗内可见
 *
 */
'use strict';

import frame from './frame';

export default class Base {
  constructor(options) {
    this.x = options.x;
    this.y = options.y;
    this.width = options.size || options.width;
    this.height = options.size || options.height;
  }

  /**
   * 绘制时的x坐标, 要根据视窗来计算位置
   * @returns {number}
   */
  get paintX() {
    return this.x - frame.x;
  }

  /**
   * 绘制时的y坐标, 要根据视窗来计算位置
   * @returns {number}
   */
  get paintY() {
    return this.y - frame.y;
  }

  /**
   * 在视窗内是否可见
   * @returns {boolean}
   */
  get visible() {
    const paintX = this.paintX;
    const paintY = this.paintY;
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;

    return (paintX + halfWidth > 0)
      && (paintX - halfWidth < frame.width)
      && (paintY + halfHeight > 0)
      && (paintY - halfHeight < frame.height)
  }
}