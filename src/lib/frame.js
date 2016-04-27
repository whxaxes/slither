/**
 * Created by wanghx on 4/27/16.
 *
 * 视窗类 由于视窗在整个游戏中只有一个, 所以做成单例
 *
 */
'use strict';

// 视窗类
class Frame {
  init(options) {
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
  }

  /**
   * 跟踪某个对象
   */
  track(obj) {
    this.translate(
      obj.x - this.x - this.width / 2,
      obj.y - this.y - this.height / 2
    )
  }

  /**
   * 移动视窗
   * @param x
   * @param y
   */
  translate(x, y) {
    this.x += x;
    this.y += y;
  }
}

export default new Frame();
