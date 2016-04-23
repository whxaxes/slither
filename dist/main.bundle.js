/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	eval("module.exports = __webpack_require__(1);\n\n\n/*****************\n ** WEBPACK FOOTER\n ** multi main\n ** module id = 0\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///multi_main?");

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	eval("/**\n * Created by wanghx on 4/23/16.\n *\n * main\n *\n */\n'use strict';\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }\n\nvar _snake = __webpack_require__(2);\n\nvar _snake2 = _interopRequireDefault(_snake);\n\nvar sprites = [];\nvar RAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {\n  window.setTimeout(callback, 1000 / 60);\n};\n\nvar canvas = document.getElementById('cas');\nvar ctx = canvas.getContext('2d');\ncanvas.width = window.innerWidth;\ncanvas.height = window.innerHeight;\n\nfunction init() {\n  var snake = new _snake2['default']({\n    ctx: ctx,\n    x: canvas.width / 2,\n    y: canvas.height / 2\n  });\n\n  sprites.push(snake);\n\n  var mousetimeout = undefined;\n  window.onmousemove = function (e) {\n    if (mousetimeout) return;\n\n    mousetimeout = setTimeout(function () {\n      return mousetimeout = null;\n    }, 100);\n\n    e = e || window.event;\n\n    snake.moveTo(e.clientX, e.clientY);\n  };\n\n  animate();\n}\n\nvar time = new Date();\nvar timeout = 10;\nfunction animate() {\n  var ntime = new Date();\n\n  if (ntime - time > timeout) {\n    ctx.clearRect(0, 0, canvas.width, canvas.height);\n\n    sprites.forEach(function (sprite) {\n      sprite.render();\n    });\n\n    time = ntime;\n  }\n\n  RAF(animate);\n}\n\ninit();\n\n/*****************\n ** WEBPACK FOOTER\n ** ./src/main.js\n ** module id = 1\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///./src/main.js?");

/***/ },
/* 2 */
/***/ function(module, exports) {

	eval("/**\n * Created by wanghx on 4/23/16.\n *\n * snake\n *\n */\n'use strict';\n\nObject.defineProperty(exports, '__esModule', {\n  value: true\n});\n\nvar _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };\n\nvar _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();\n\nfunction _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }\n\nvar SPEED = 2;\n\nvar Base = (function () {\n  function Base(options) {\n    _classCallCheck(this, Base);\n\n    this.ctx = options.ctx;\n    this.x = options.x;\n    this.y = options.y;\n    this.c = options.c || 0;\n    this.r = 20;\n\n    this.vx = 0;\n    this.vy = 0;\n    this.tox = this.x;\n    this.toy = this.y;\n\n    // 生成元素图片镜像\n    this.createImage();\n  }\n\n  // 蛇的身躯\n\n  /**\n   * 生成图片镜像\n   */\n\n  _createClass(Base, [{\n    key: 'createImage',\n    value: function createImage() {\n      this.img = document.createElement('canvas');\n      this.img.width = this.r * 2 + 10;\n      this.img.height = this.r * 2 + 10;\n\n      var ctx = this.img.getContext('2d');\n\n      ctx.save();\n      ctx.beginPath();\n      ctx.arc(this.img.width / 2, this.img.height / 2, this.r, 0, Math.PI * 2);\n      ctx.fillStyle = 'rgb(' + this.c + ',' + this.c + ',' + this.c + ')';\n      ctx.strokeStyle = 'rgb(255,255,255)';\n      ctx.stroke();\n      ctx.fill();\n      ctx.restore();\n\n      return ctx;\n    }\n\n    /**\n     * 给予目标点, 计算速度\n     * @param x\n     * @param y\n     */\n  }, {\n    key: 'moveTo',\n    value: function moveTo(x, y) {\n      this.tox = x;\n      this.toy = y;\n\n      var dis_x = this.tox - this.x;\n      var dis_y = this.toy - this.y;\n      var dis = Math.sqrt(dis_x * dis_x + dis_y * dis_y);\n\n      this.vy = dis_y * (SPEED / dis);\n      this.vx = dis_x * (SPEED / dis);\n    }\n\n    /**\n     * 渲染镜像图片\n     */\n  }, {\n    key: 'render',\n    value: function render() {\n      this.ctx.drawImage(this.img, this.x - this.img.width / 2, this.y - this.img.height / 2);\n    }\n  }]);\n\n  return Base;\n})();\n\nvar Body = (function (_Base) {\n  _inherits(Body, _Base);\n\n  function Body(options) {\n    _classCallCheck(this, Body);\n\n    _get(Object.getPrototypeOf(Body.prototype), 'constructor', this).call(this, options);\n\n    this.dis = options.dis;\n  }\n\n  // 蛇类\n\n  _createClass(Body, [{\n    key: 'update',\n    value: function update() {\n      var dis_x = this.tox - this.x;\n      var dis_y = this.toy - this.y;\n      var dis = Math.sqrt(dis_x * dis_x + dis_y * dis_y);\n\n      if (dis <= this.dis) return;\n\n      this.x += this.vx;\n      this.y += this.vy;\n    }\n  }]);\n\n  return Body;\n})(Base);\n\nvar Snake = (function (_Base2) {\n  _inherits(Snake, _Base2);\n\n  function Snake(options) {\n    _classCallCheck(this, Snake);\n\n    _get(Object.getPrototypeOf(Snake.prototype), 'constructor', this).call(this, options);\n\n    this.angle = 0;\n    this.bodyLength = 20;\n    this.bodyDis = this.r * 2 / 3;\n    this.bodyColor = ~ ~(240 / this.bodyLength);\n    this.initBody();\n  }\n\n  /**\n   * 添加画眼睛的功能\n   */\n\n  _createClass(Snake, [{\n    key: 'createImage',\n    value: function createImage() {\n      var ctx = _get(Object.getPrototypeOf(Snake.prototype), 'createImage', this).call(this);\n      var eye_r = this.r / 3;\n      var eye_x = this.img.width / 2 + this.r - eye_r;\n      var eye_y = this.img.height / 2 - this.r + eye_r;\n\n      // 画左眼\n      ctx.beginPath();\n      ctx.fillStyle = '#fff';\n      ctx.arc(eye_x, eye_y, eye_r, 0, Math.PI * 2);\n      ctx.fill();\n      ctx.stroke();\n      ctx.fillStyle = '#000';\n      ctx.fillRect(eye_x + eye_r / 3, eye_y - 1, 2, 2);\n\n      // 画右眼\n      eye_y = this.img.height / 2 + this.r - eye_r;\n      ctx.beginPath();\n      ctx.fillStyle = '#fff';\n      ctx.arc(eye_x, eye_y, eye_r, 0, Math.PI * 2);\n      ctx.fill();\n      ctx.stroke();\n      ctx.fillStyle = '#000';\n      ctx.fillRect(eye_x + eye_r / 3, eye_y - 1, 2, 2);\n    }\n  }, {\n    key: 'initBody',\n    value: function initBody() {\n      this.bodys = [];\n      var x = this.x;\n      var c = this.c;\n\n      for (var i = 0; i < this.bodyLength; i++) {\n        x -= this.bodyDis;\n        c += this.bodyColor;\n\n        this.bodys.push(new Body({\n          ctx: this.ctx,\n          x: x,\n          y: this.y,\n          c: c,\n          dis: this.bodyDis\n        }));\n      }\n    }\n  }, {\n    key: 'moveTo',\n    value: function moveTo(x, y) {\n      _get(Object.getPrototypeOf(Snake.prototype), 'moveTo', this).call(this, x, y);\n\n      // 调整头部的方向\n      this.angle = Math.atan(this.vy / this.vx);\n\n      if (this.vx < 0) {\n        this.angle += Math.PI;\n      }\n    }\n  }, {\n    key: 'update',\n    value: function update() {\n      this.x += this.vx;\n      this.y += this.vy;\n    }\n  }, {\n    key: 'render',\n    value: function render() {\n      for (var i = this.bodyLength - 1; i >= 0; i--) {\n        var body = this.bodys[i];\n        var front = this.bodys[i - 1] || this;\n\n        body.moveTo(front.x, front.y);\n\n        body.update();\n        body.render();\n      }\n\n      this.update();\n\n      var ctx = this.ctx;\n\n      ctx.save();\n      ctx.translate(this.x, this.y);\n      ctx.rotate(this.angle);\n      ctx.drawImage(this.img, -this.img.width / 2, -this.img.height / 2);\n      ctx.restore();\n    }\n  }]);\n\n  return Snake;\n})(Base);\n\nexports['default'] = Snake;\nmodule.exports = exports['default'];\n\n/*****************\n ** WEBPACK FOOTER\n ** ./src/snake.js\n ** module id = 2\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///./src/snake.js?");

/***/ }
/******/ ]);