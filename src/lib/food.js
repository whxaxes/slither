/**
 * Created by wanghx on 4/27/16.
 *
 * food
 *
 */
'use strict';

import Base from './base';
import map from './map';

export class Food extends Base{
  constructor(options) {
    super(options);

    this.point = options.point || 10;
    this.r = this.point / 5;  // 食物的半径, 发光半径
    this.cr = this.r;         // 食物实体半径
  }

  render() {
    map.ctx.fillStyle = '#000';

    // 绘制光圈
    map.ctx.globalAlpha = 0.5;
    map.ctx.beginPath();
    map.ctx.arc(this.paintX, this.paintY, this.r, 0, Math.PI * 2);

    // 绘制实体
    map.ctx.globalAlpha = 1;
    map.ctx.beginPath();
    map.ctx.arc(this.paintX, this.paintY, this.cr, 0, Math.PI * 2);
    map.ctx.fill();
  }
}
