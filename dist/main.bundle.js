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

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _stats = __webpack_require__(2);

	var _stats2 = _interopRequireDefault(_stats);

	var _snake = __webpack_require__(3);

	var _snake2 = _interopRequireDefault(_snake);

	var _food = __webpack_require__(8);

	var _food2 = _interopRequireDefault(_food);

	var _frame = __webpack_require__(6);

	var _frame2 = _interopRequireDefault(_frame);

	var _map = __webpack_require__(5);

	var _map2 = _interopRequireDefault(_map);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
	  window.setTimeout(callback, 1000 / 60);
	}; /**
	    * Created by wanghx on 4/23/16.
	    *
	    * main
	    *
	    */

	var canvas = document.getElementById('cas');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	// fps状态
	var stats = new _stats2.default();
	document.body.appendChild(stats.dom);

	// 初始化地图对象
	_map2.default.init({
	  canvas: canvas,
	  width: 10000,
	  height: 10000
	});

	// 初始化视窗对象
	_frame2.default.init({
	  x: 1000,
	  y: 1000,
	  width: canvas.width,
	  height: canvas.height
	});

	// 创建蛇类对象
	var snake = new _snake2.default({
	  x: _frame2.default.x + _frame2.default.width / 2,
	  y: _frame2.default.y + _frame2.default.height / 2,
	  size: 40,
	  length: 10,
	  color: '#fff'
	});

	// 食物生成方法
	var foodsNum = 1000;
	var foods = [];
	function createFood(num) {
	  for (var i = 0; i < num; i++) {
	    var point = ~ ~(Math.random() * 30 + 50);
	    var size = ~ ~(point / 3);

	    foods.push(new _food2.default({
	      x: ~ ~(Math.random() * (_map2.default.width - 2 * size) + size),
	      y: ~ ~(Math.random() * (_map2.default.height - 2 * size) + size),
	      size: size, point: point
	    }));
	  }
	}

	/**
	 * 碰撞检测
	 * @param dom
	 * @param dom2
	 * @param isRect   是否为矩形
	 */
	function collision(dom, dom2, isRect) {
	  var disX = dom.x - dom2.x;
	  var disY = dom.y - dom2.y;

	  if (isRect) {
	    return Math.abs(disX) < dom.width + dom2.width && Math.abs(disY) < dom.height + dom2.height;
	  }

	  return Math.hypot(disX, disY) < (dom.width + dom2.width) / 2;
	}

	// 创建一些食物
	createFood(foodsNum);

	// 动画逻辑
	var timeout = 0;
	var time = new Date();
	function animate() {
	  var ntime = new Date();

	  stats.begin();

	  if (ntime - time > timeout) {
	    _map2.default.clear();

	    // 让视窗跟随蛇的位置更改而更改
	    _frame2.default.track(snake);

	    _map2.default.render();

	    // 渲染食物, 以及检测食物与蛇头的碰撞
	    foods.slice(0).forEach(function (food) {
	      food.render();

	      if (food.visible && collision(snake.header, food)) {
	        foods.splice(foods.indexOf(food), 1);
	        snake.eat(food);
	        createFood(1);
	      }
	    });

	    snake.render();

	    _map2.default.renderSmallMap();

	    _map2.default.update();

	    time = ntime;
	  }

	  stats.end();

	  raf(animate);
	}

	animate();

/***/ },
/* 2 */
/***/ function(module, exports) {

	// stats.js - http://github.com/mrdoob/stats.js
	var Stats=function(){function h(a){c.appendChild(a.dom);return a}function k(a){for(var d=0;d<c.children.length;d++)c.children[d].style.display=d===a?"block":"none";l=a}var l=0,c=document.createElement("div");c.style.cssText="position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000";c.addEventListener("click",function(a){a.preventDefault();k(++l%c.children.length)},!1);var g=(performance||Date).now(),e=g,a=0,r=h(new Stats.Panel("FPS","#0ff","#002")),f=h(new Stats.Panel("MS","#0f0","#020"));
	if(self.performance&&self.performance.memory)var t=h(new Stats.Panel("MB","#f08","#201"));k(0);return{REVISION:16,dom:c,addPanel:h,showPanel:k,begin:function(){g=(performance||Date).now()},end:function(){a++;var c=(performance||Date).now();f.update(c-g,200);if(c>e+1E3&&(r.update(1E3*a/(c-e),100),e=c,a=0,t)){var d=performance.memory;t.update(d.usedJSHeapSize/1048576,d.jsHeapSizeLimit/1048576)}return c},update:function(){g=this.end()},domElement:c,setMode:k}};
	Stats.Panel=function(h,k,l){var c=Infinity,g=0,e=Math.round,a=e(window.devicePixelRatio||1),r=80*a,f=48*a,t=3*a,u=2*a,d=3*a,m=15*a,n=74*a,p=30*a,q=document.createElement("canvas");q.width=r;q.height=f;q.style.cssText="width:80px;height:48px";var b=q.getContext("2d");b.font="bold "+9*a+"px Helvetica,Arial,sans-serif";b.textBaseline="top";b.fillStyle=l;b.fillRect(0,0,r,f);b.fillStyle=k;b.fillText(h,t,u);b.fillRect(d,m,n,p);b.fillStyle=l;b.globalAlpha=.9;b.fillRect(d,m,n,p);return{dom:q,update:function(f,
	v){c=Math.min(c,f);g=Math.max(g,f);b.fillStyle=l;b.globalAlpha=1;b.fillRect(0,0,r,m);b.fillStyle=k;b.fillText(e(f)+" "+h+" ("+e(c)+"-"+e(g)+")",t,u);b.drawImage(q,d+a,m,n-a,p,d,m,n-a,p);b.fillRect(d+n-a,m,a,p);b.fillStyle=l;b.globalAlpha=.9;b.fillRect(d+n-a,m,a,e((1-f/v)*p))}}};"object"===typeof module&&(module.exports=Stats);


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _base = __webpack_require__(4);

	var _base2 = _interopRequireDefault(_base);

	var _map = __webpack_require__(5);

	var _map2 = _interopRequireDefault(_map);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Created by wanghx on 4/23/16.
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * snake
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

	var SPEED = 3;
	var BASE_ANGLE = Math.PI * 200; // 用于保证蛇的角度一直都是正数

	// 蛇头和蛇身的基类

	var SnakeBase = function (_Base) {
	  _inherits(SnakeBase, _Base);

	  function SnakeBase(options) {
	    _classCallCheck(this, SnakeBase);

	    // 垂直和水平速度

	    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SnakeBase).call(this, options));

	    _this.vx = SPEED;
	    _this.vy = 0;

	    // 添加贴图
	    _this.img = options.img;
	    return _this;
	  }

	  // 设置基类的速度


	  _createClass(SnakeBase, [{
	    key: 'setSize',


	    /**
	     * 设置宽度和高度
	     * @param width
	     * @param height
	     */
	    value: function setSize(width, height) {
	      this.width = width;
	      this.height = height || width;
	    }

	    /**
	     * 更新位置
	     */

	  }, {
	    key: 'update',
	    value: function update() {
	      this.x += this.vx;
	      this.y += this.vy;
	    }

	    /**
	     * 渲染镜像图片
	     */

	  }, {
	    key: 'render',
	    value: function render() {
	      this.update();

	      // 如果该元素在视窗内不可见, 则不进行绘制
	      if (!this.visible) return;

	      // 如果该对象有角度属性, 则使用translate来绘制, 因为要旋转
	      if (this.hasOwnProperty('angle')) {
	        _map2.default.ctx.save();
	        _map2.default.ctx.translate(this.paintX, this.paintY);
	        _map2.default.ctx.rotate(this.angle - BASE_ANGLE - Math.PI / 2);
	        _map2.default.ctx.drawImage(this.img, -this.paintWidth / 2, -this.paintHeight / 2, this.paintWidth, this.paintHeight);
	        _map2.default.ctx.restore();
	      } else {
	        _map2.default.ctx.drawImage(this.img, this.paintX - this.paintWidth / 2, this.paintY - this.paintHeight / 2, this.paintWidth, this.paintHeight);
	      }

	      // 绘制移动方向, debug用
	      //    map.ctx.beginPath();
	      //    map.ctx.moveTo(
	      //      this.paintX - (this.paintWidth * 0.5 * this.vx / this.speed),
	      //      this.paintY - (this.paintWidth * 0.5 * this.vy / this.speed)
	      //    );
	      //    map.ctx.lineTo(this.paintX, this.paintY);
	      //    map.ctx.strokeStyle = '#000';
	      //    map.ctx.stroke();
	    }
	  }, {
	    key: 'speed',
	    set: function set(val) {
	      this._speed = val;

	      // 重新计算水平垂直速度
	      this.velocity();
	    },
	    get: function get() {
	      return this._speed ? this._speed : this._speed = this.tracer ? this.tracer.speed : SPEED;
	    }
	  }]);

	  return SnakeBase;
	}(_base2.default);

	// 蛇的身躯类


	var SnakeBody = function (_SnakeBase) {
	  _inherits(SnakeBody, _SnakeBase);

	  function SnakeBody(options) {
	    _classCallCheck(this, SnakeBody);

	    // 设置跟踪者

	    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(SnakeBody).call(this, options));

	    _this2.tracer = options.tracer;

	    _this2.tracerDis = _this2.distance;

	    _this2.savex = _this2.tox = _this2.tracer.x - _this2.distance;
	    _this2.savey = _this2.toy = _this2.tracer.y;
	    return _this2;
	  }

	  _createClass(SnakeBody, [{
	    key: 'update',
	    value: function update() {
	      if (this.tracerDis >= this.distance) {
	        var tracer = this.tracer;

	        // 计算位置的偏移量
	        this.tox = this.savex + (this.tracerDis - this.distance) * tracer.vx / tracer.speed;
	        this.toy = this.savey + (this.tracerDis - this.distance) * tracer.vy / tracer.speed;

	        this.velocity(this.tox, this.toy);

	        this.tracerDis = 0;

	        // 保存tracer位置
	        this.savex = this.tracer.x;
	        this.savey = this.tracer.y;
	      }

	      this.tracerDis += this.tracer.speed;

	      if (Math.abs(this.tox - this.x) <= Math.abs(this.vx)) {
	        this.x = this.tox;
	      } else {
	        this.x += this.vx;
	      }

	      if (Math.abs(this.toy - this.y) <= Math.abs(this.vy)) {
	        this.y = this.toy;
	      } else {
	        this.y += this.vy;
	      }
	    }

	    /**
	     * 根据目标点, 计算速度
	     * @param x
	     * @param y
	     */

	  }, {
	    key: 'velocity',
	    value: function velocity(x, y) {
	      this.tox = x || this.tox;
	      this.toy = y || this.toy;

	      var disX = this.tox - this.x;
	      var disY = this.toy - this.y;
	      var dis = Math.hypot(disX, disY);

	      this.vx = this.speed * disX / dis || 0;
	      this.vy = this.speed * disY / dis || 0;
	    }
	  }, {
	    key: 'distance',
	    get: function get() {
	      return this.tracer.width * 0.2;
	    }
	  }]);

	  return SnakeBody;
	}(SnakeBase);

	// 蛇头类


	var SnakeHeader = function (_SnakeBase2) {
	  _inherits(SnakeHeader, _SnakeBase2);

	  function SnakeHeader(options) {
	    _classCallCheck(this, SnakeHeader);

	    var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(SnakeHeader).call(this, options));

	    _this3.angle = BASE_ANGLE + Math.PI / 2;
	    _this3.toAngle = _this3.angle;
	    return _this3;
	  }

	  /**
	   * 转向某个角度
	   */


	  _createClass(SnakeHeader, [{
	    key: 'directTo',
	    value: function directTo(angle) {
	      // 老的目标角度, 但是是小于360度的, 因为每次计算出来的目标角度也是0 - 360度
	      var oldAngle = Math.abs(this.toAngle % (Math.PI * 2));

	      // 转了多少圈
	      var rounds = ~ ~(this.toAngle / (Math.PI * 2));

	      this.toAngle = angle;

	      if (oldAngle >= Math.PI * 3 / 2 && this.toAngle <= Math.PI / 2) {
	        // 角度从第四象限左划至第一象限, 增加圈数
	        rounds++;
	      } else if (oldAngle <= Math.PI / 2 && this.toAngle >= Math.PI * 3 / 2) {
	        // 角度从第一象限划至第四象限, 减少圈数
	        rounds--;
	      }

	      // 计算真实要转到的角度
	      this.toAngle += rounds * Math.PI * 2;
	    }

	    // 根据蛇头角度计算水平速度和垂直速度

	  }, {
	    key: 'velocity',
	    value: function velocity() {
	      var angle = this.angle % (Math.PI * 2);
	      var vx = Math.abs(this.speed * Math.sin(angle));
	      var vy = Math.abs(this.speed * Math.cos(angle));

	      if (angle < Math.PI / 2) {
	        this.vx = vx;
	        this.vy = -vy;
	      } else if (angle < Math.PI) {
	        this.vx = vx;
	        this.vy = vy;
	      } else if (angle < Math.PI * 3 / 2) {
	        this.vx = -vx;
	        this.vy = vy;
	      } else {
	        this.vx = -vx;
	        this.vy = -vy;
	      }
	    }

	    /**
	     * 增加蛇头的逐帧逻辑
	     */

	  }, {
	    key: 'update',
	    value: function update() {
	      this.turnAround();

	      this.velocity();

	      _get(Object.getPrototypeOf(SnakeHeader.prototype), 'update', this).call(this);

	      // 不让蛇走出边界
	      var whalf = this.width / 2;
	      if (this.x < whalf) {
	        this.x = whalf;
	      } else if (this.x + whalf > _map2.default.width) {
	        this.x = _map2.default.width - whalf;
	      }

	      var hhalf = this.height / 2;
	      if (this.y < hhalf) {
	        this.y = hhalf;
	      } else if (this.y + hhalf > _map2.default.height) {
	        this.y = _map2.default.height - hhalf;
	      }
	    }

	    /**
	     * 蛇头转头
	     */

	  }, {
	    key: 'turnAround',
	    value: function turnAround() {
	      var angleDistance = this.toAngle - this.angle; // 与目标角度之间的角度差
	      var turnSpeed = 0.045; // 转头速度

	      // 当转到目标角度, 重置蛇头角度
	      if (Math.abs(angleDistance) <= turnSpeed) {
	        this.toAngle = this.angle = BASE_ANGLE + this.toAngle % (Math.PI * 2);
	      } else {
	        this.angle += Math.sign(angleDistance) * turnSpeed;
	      }
	    }
	  }]);

	  return SnakeHeader;
	}(SnakeBase);

	// 蛇类


	var Snake = function () {
	  function Snake(options) {
	    _classCallCheck(this, Snake);

	    this.bodys = [];
	    this.point = 0;

	    // 皮肤颜色
	    this.color = options.color || '#fff';

	    // 描边颜色
	    this.color_2 = '#000';

	    // 蛇头图层
	    this.headerImage = document.createElement('canvas');

	    // 蛇身图层
	    this.bodyImage = document.createElement('canvas');

	    // 初始化
	    this.init(options);
	  }

	  _createClass(Snake, [{
	    key: 'init',


	    /**
	     * 初始化蛇实例
	     * @param options
	     */
	    value: function init(options) {
	      // 创建脑袋
	      this.header = new SnakeHeader(Object.assign(options, {
	        img: this.headerImage
	      }));

	      // 创建身躯, 给予各个身躯跟踪目标
	      for (var i = 0; i < options.length; i++) {
	        this.bodys.push(new SnakeBody(Object.assign(options, {
	          tracer: this.bodys[i - 1] || this.header,
	          img: this.bodyImage
	        })));
	      }

	      // 更新图层
	      this.updateImage();

	      // 事件绑定
	      this.binding();
	    }

	    /**
	     * 更新图层
	     */

	  }, {
	    key: 'updateImage',
	    value: function updateImage() {
	      // 更新蛇身的图层
	      this.updateBodyImage();

	      // 更新蛇身的图层
	      this.updateHeaderImage();
	    }

	    /**
	     * 更新蛇身贴图
	     */

	  }, {
	    key: 'updateBodyImage',
	    value: function updateBodyImage() {
	      var img = this.bodyImage;
	      var body = this.bodys[0];
	      var imgctx = img.getContext('2d');

	      if (!body) return;

	      this.drawMain(imgctx, img, body.paintWidth, body.paintHeight);
	    }

	    /**
	     * 更新蛇头贴图
	     */

	  }, {
	    key: 'updateHeaderImage',
	    value: function updateHeaderImage() {
	      var img = this.headerImage;
	      var header = this.header;
	      var imgctx = img.getContext('2d');
	      var eyeRadius = header.paintWidth * 0.2;

	      this.drawMain(imgctx, img, header.paintWidth, header.paintHeight);

	      // 画左眼
	      this.drawEye(imgctx, img.width / 2 + header.paintWidth / 2 - eyeRadius, img.height / 2 - header.paintHeight / 2 + eyeRadius, eyeRadius);

	      // 画右眼
	      this.drawEye(imgctx, img.width / 2 + header.paintWidth / 2 - eyeRadius, img.height / 2 + header.paintHeight / 2 - eyeRadius, eyeRadius);
	    }

	    /**
	     * 绘制主体
	     */

	  }, {
	    key: 'drawMain',
	    value: function drawMain(ctx, img, width, height) {
	      img.width = width + 4;
	      img.height = height + 4;

	      ctx.lineWidth = 1.5;
	      ctx.beginPath();
	      ctx.arc(img.width / 2, img.height / 2, width / 2, 0, Math.PI * 2);
	      ctx.fillStyle = this.color;
	      ctx.strokeStyle = this.color_2;
	      ctx.stroke();
	      ctx.fill();
	    }

	    /**
	     * 绘制眼睛的封装
	     */

	  }, {
	    key: 'drawEye',
	    value: function drawEye(ctx, eyeX, eyeY, eyeRadius) {
	      ctx.beginPath();
	      ctx.fillStyle = '#fff';
	      ctx.strokeStyle = this.color_2;
	      ctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
	      ctx.fill();
	      ctx.stroke();

	      ctx.beginPath();
	      ctx.fillStyle = '#000';
	      ctx.arc(eyeX + eyeRadius / 2, eyeY, eyeRadius / 4, 0, Math.PI * 2);
	      ctx.fill();
	    }

	    /**
	     * 蛇与鼠标的交互事件
	     */

	  }, {
	    key: 'binding',
	    value: function binding() {
	      var self = this;

	      // 监听地图缩放变化, 更新贴图大小
	      _map2.default.on('scale_changed', function () {
	        self.updateImage();
	      });

	      // 鼠标/手指 跟蛇运动的交互事件绑定
	      if (navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i)) {
	        window.addEventListener('touchmove', function (e) {
	          e.preventDefault();
	          self.moveTo(e.touches[0].pageX, e.touches[0].pageY);
	        });

	        window.addEventListener('touchstart', function (e) {
	          e.preventDefault();
	          self.moveTo(e.touches[0].pageX, e.touches[0].pageY);
	        });
	      } else {
	        // 蛇头跟随鼠标的移动而变更移动方向
	        window.addEventListener('mousemove', function () {
	          var e = arguments.length <= 0 || arguments[0] === undefined ? window.event : arguments[0];
	          return self.moveTo(e.clientX, e.clientY);
	        });

	        // 鼠标按下让蛇加速
	        window.addEventListener('mousedown', self.speedUp.bind(self));

	        // 鼠标抬起停止加速
	        window.addEventListener('mouseup', self.speedDown.bind(self));
	      }
	    }

	    /**
	     * 加速
	     */

	  }, {
	    key: 'speedUp',
	    value: function speedUp() {
	      this.header.speed = 5;
	      this.bodys.forEach(function (body) {
	        body.speed = 5;
	      });
	    }

	    /**
	     * 恢复原速度
	     */

	  }, {
	    key: 'speedDown',
	    value: function speedDown() {
	      this.header.speed = SPEED;
	      this.bodys.forEach(function (body) {
	        body.speed = SPEED;
	      });
	    }

	    /**
	     * 根据传入坐标, 获取坐标点相对于蛇的角度
	     * @param nx
	     * @param ny
	     */

	  }, {
	    key: 'moveTo',
	    value: function moveTo(nx, ny) {
	      var x = nx - this.header.paintX;
	      var y = this.header.paintY - ny;
	      var angle = Math.atan(Math.abs(x / y));

	      // 计算角度, 角度值为 0-360
	      if (x > 0 && y < 0) {
	        angle = Math.PI - angle;
	      } else if (x < 0 && y < 0) {
	        angle = Math.PI + angle;
	      } else if (x < 0 && y > 0) {
	        angle = Math.PI * 2 - angle;
	      }

	      this.header.directTo(angle);
	    }

	    /**
	     * 吃掉食物
	     * @param food
	     */

	  }, {
	    key: 'eat',
	    value: function eat(food) {
	      this.foodNum = this.foodNum || 0;
	      this.point += food.point;
	      this.foodNum++;

	      // 增加分数引起虫子体积增大
	      var added = food.point / 100;
	      this.header.setSize(this.header.width + added);
	      this.bodys.forEach(function (body) {
	        body.setSize(body.width + added);
	      });

	      // 调整地图缩放比例, 调整缩放比例的时候会更新图层, 所以不再次更新
	      _map2.default.setScale(_map2.default.scale + added / (this.header.width * 3));

	      // 每吃两个个食物, 都增加一截身躯
	      if (this.foodNum % 2 === 0) {
	        var lastBody = this.bodys[this.bodys.length - 1];
	        this.bodys.push(new SnakeBody({
	          x: lastBody.x,
	          y: lastBody.y,
	          size: lastBody.width,
	          color: lastBody.color,
	          tracer: lastBody,
	          img: this.bodyImage
	        }));
	      }
	    }

	    // 渲染蛇头蛇身

	  }, {
	    key: 'render',
	    value: function render() {
	      for (var i = this.bodys.length - 1; i >= 0; i--) {
	        this.bodys[i].render();
	      }

	      this.header.render();
	    }
	  }, {
	    key: 'x',
	    get: function get() {
	      return this.header.x;
	    }
	  }, {
	    key: 'y',
	    get: function get() {
	      return this.header.y;
	    }
	  }]);

	  return Snake;
	}();

	exports.default = Snake;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Created by wanghx on 4/27/16.
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * base    地图上的元素基础类, 默认为圆
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * 基础属性:
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *  - x             元素的中心点x坐标
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *  - y             元素的中心店y坐标
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *  - width         元素宽度
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *  - height        元素高度
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *  - paintX        元素的绘制坐标
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *  - paintY        元素的绘制坐标
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *  - paintWidth    元素的绘制宽度
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *  - paintHeight   元素的绘制高度
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *  - visible       元素是否在视窗内可见
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

	var _map = __webpack_require__(5);

	var _map2 = _interopRequireDefault(_map);

	var _frame = __webpack_require__(6);

	var _frame2 = _interopRequireDefault(_frame);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Base = function () {
	  function Base(options) {
	    _classCallCheck(this, Base);

	    this.x = options.x;
	    this.y = options.y;
	    this.width = options.size || options.width;
	    this.height = options.size || options.height;
	  }

	  /**
	   * 绘制时的x坐标, 要根据视窗来计算位置
	   * @returns {number}
	   */


	  _createClass(Base, [{
	    key: 'paintX',
	    get: function get() {
	      return _map2.default.relative(this.x) - _frame2.default.x;
	    }

	    /**
	     * 绘制时的y坐标, 要根据视窗来计算位置
	     * @returns {number}
	     */

	  }, {
	    key: 'paintY',
	    get: function get() {
	      return _map2.default.relative(this.y) - _frame2.default.y;
	    }

	    /**
	     * 绘制宽度
	     * @returns {*}
	     */

	  }, {
	    key: 'paintWidth',
	    get: function get() {
	      return _map2.default.relative(this.width);
	    }

	    /**
	     * 绘制高度
	     * @returns {*}
	     */

	  }, {
	    key: 'paintHeight',
	    get: function get() {
	      return _map2.default.relative(this.height);
	    }

	    /**
	     * 在视窗内是否可见
	     * @returns {boolean}
	     */

	  }, {
	    key: 'visible',
	    get: function get() {
	      var paintX = this.paintX;
	      var paintY = this.paintY;
	      var halfWidth = this.paintWidth / 2;
	      var halfHeight = this.paintHeight / 2;

	      return paintX + halfWidth > 0 && paintX - halfWidth < _frame2.default.width && paintY + halfHeight > 0 && paintY - halfHeight < _frame2.default.height;
	    }
	  }]);

	  return Base;
	}();

	exports.default = Base;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _frame = __webpack_require__(6);

	var _frame2 = _interopRequireDefault(_frame);

	var _eventemitter = __webpack_require__(7);

	var _eventemitter2 = _interopRequireDefault(_eventemitter);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Created by wanghx on 4/25/16.
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * 地图类 由于地图在整个游戏中只有一个, 所以做成单例
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

	// 地图类

	var Map = function (_EventEmitter) {
	  _inherits(Map, _EventEmitter);

	  function Map() {
	    _classCallCheck(this, Map);

	    // 背景块的大小

	    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Map).call(this));

	    _this.blockWidth = 150;
	    _this.blockHeight = 150;
	    return _this;
	  }

	  /**
	   * 初始化map对象
	   * @param options
	   */


	  _createClass(Map, [{
	    key: 'init',
	    value: function init(options) {
	      this.canvas = options.canvas;
	      this.ctx = this.canvas.getContext('2d');

	      // 地图大小
	      this.width = options.width;
	      this.height = options.height;

	      // 地图比例
	      this.scale = options.scale || 1;
	    }

	    /**
	     * 设置缩放比例
	     * @param value
	     */

	  }, {
	    key: 'setScale',
	    value: function setScale(scale) {
	      this.toScale = scale;
	    }

	    /**
	     * 清空地图上的内容
	     */

	  }, {
	    key: 'clear',
	    value: function clear() {
	      this.ctx.clearRect(0, 0, _frame2.default.width, _frame2.default.height);
	    }

	    /**
	     * 相对于地图scale的值
	     * @param val
	     * @returns {*}
	     */

	  }, {
	    key: 'relative',
	    value: function relative(val) {
	      return val + val * (1 - this.scale);
	    }

	    /**
	     * 对地图本身的更新都在此处进行
	     */

	  }, {
	    key: 'update',
	    value: function update() {
	      if (this.toScale && this.scale !== this.toScale) {
	        this.scale = this.toScale;
	      }
	    }

	    /**
	     * 渲染地图
	     */

	  }, {
	    key: 'render',
	    value: function render() {
	      this.ctx.save();
	      var beginX = _frame2.default.x < 0 ? -_frame2.default.x : -_frame2.default.x % this.paintBlockWidth;
	      var beginY = _frame2.default.y < 0 ? -_frame2.default.y : -_frame2.default.y % this.paintBlockHeight;
	      var endX = _frame2.default.x + _frame2.default.width > this.paintWidth ? this.paintWidth - _frame2.default.x : beginX + _frame2.default.width + this.paintBlockWidth;
	      var endY = _frame2.default.y + _frame2.default.height > this.paintHeight ? this.paintHeight - _frame2.default.y : beginY + _frame2.default.height + this.paintBlockHeight;

	      // 铺底色
	      this.ctx.fillStyle = '#999';
	      this.ctx.fillRect(beginX, beginY, endX - beginX, endY - beginY);

	      // 画方格砖
	      this.ctx.lineWidth = 0.5;
	      this.ctx.strokeStyle = '#fff';
	      for (var x = beginX; x <= endX; x += this.paintBlockWidth) {
	        for (var y = beginY; y <= endY; y += this.paintBlockWidth) {
	          var cx = endX - x;
	          var cy = endY - y;
	          var w = cx < this.paintBlockWidth ? cx : this.paintBlockWidth;
	          var h = cy < this.paintBlockHeight ? cy : this.paintBlockHeight;

	          this.ctx.strokeRect(x, y, w, h);
	        }
	      }

	      this.ctx.restore();
	    }

	    /**
	     * 画小地图
	     */

	  }, {
	    key: 'renderSmallMap',
	    value: function renderSmallMap() {
	      // 小地图外壳, 圆圈
	      var margin = 30;
	      var smapr = 50;
	      var smapx = _frame2.default.width - smapr - margin;
	      var smapy = _frame2.default.height - smapr - margin;

	      // 地图在小地图中的位置和大小
	      var smrect = 50;
	      var smrectw = this.paintWidth > this.paintHeight ? smrect : this.paintWidth * smrect / this.paintHeight;
	      var smrecth = this.paintWidth > this.paintHeight ? this.paintHeight * smrect / this.paintWidth : smrect;
	      var smrectx = smapx - smrectw / 2;
	      var smrecty = smapy - smrecth / 2;

	      // 相对比例
	      var radio = smrectw / this.paintWidth;

	      // 视窗在小地图中的位置和大小
	      var smframex = _frame2.default.x * radio + smrectx;
	      var smframey = _frame2.default.y * radio + smrecty;
	      var smframew = _frame2.default.width * radio;
	      var smframeh = _frame2.default.height * radio;

	      this.ctx.save();
	      this.ctx.globalAlpha = 0.8;

	      // 画个圈先
	      this.ctx.beginPath();
	      this.ctx.arc(smapx, smapy, smapr, 0, Math.PI * 2);
	      this.ctx.fillStyle = '#000';
	      this.ctx.fill();
	      this.ctx.stroke();

	      // 画缩小版地图
	      this.ctx.fillStyle = '#999';
	      this.ctx.fillRect(smrectx, smrecty, smrectw, smrecth);

	      // 画视窗
	      //    this.ctx.strokeRect(smframex, smframey, smframew, smframeh);

	      this.ctx.restore();

	      // 画蛇蛇位置
	      this.ctx.fillStyle = '#fff';
	      this.ctx.fillRect(smframex + smframew / 2 - 2, smframey + smframeh / 2 - 2, 4, 4);
	    }
	  }, {
	    key: 'scale',
	    set: function set(value) {
	      if (value >= 1.6 || value < 1 || this._scale === value) {
	        return;
	      }

	      this._scale = value;

	      this.paintBlockWidth = this.relative(this.blockWidth);
	      this.paintBlockHeight = this.relative(this.blockHeight);
	      this.paintWidth = this.relative(this.width);
	      this.paintHeight = this.relative(this.height);

	      this.emit('scale_changed');
	    },
	    get: function get() {
	      return this._scale;
	    }
	  }]);

	  return Map;
	}(_eventemitter2.default);

	exports.default = new Map();

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Created by wanghx on 4/27/16.
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * 视窗类 由于视窗在整个游戏中只有一个, 所以做成单例
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

	var _map = __webpack_require__(5);

	var _map2 = _interopRequireDefault(_map);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	// 视窗类

	var Frame = function () {
	  function Frame() {
	    _classCallCheck(this, Frame);
	  }

	  _createClass(Frame, [{
	    key: 'init',
	    value: function init(options) {
	      var self = this;

	      this.x = options.x;
	      this.y = options.y;
	      this.width = options.width;
	      this.height = options.height;

	      _map2.default.on('scale_changed', function () {
	        self.x = _map2.default.relative(self.x);
	        self.y = _map2.default.relative(self.y);
	      });
	    }

	    /**
	     * 跟踪某个对象
	     */

	  }, {
	    key: 'track',
	    value: function track(obj) {
	      this.translate(_map2.default.relative(obj.x) - this.x - this.width / 2, _map2.default.relative(obj.y) - this.y - this.height / 2);
	    }

	    /**
	     * 移动视窗
	     * @param x
	     * @param y
	     */

	  }, {
	    key: 'translate',
	    value: function translate(x, y) {
	      this.x += x;
	      this.y += y;
	    }
	  }]);

	  return Frame;
	}();

	exports.default = new Frame();

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var has = Object.prototype.hasOwnProperty;

	//
	// We store our EE objects in a plain object whose properties are event names.
	// If `Object.create(null)` is not supported we prefix the event names with a
	// `~` to make sure that the built-in object properties are not overridden or
	// used as an attack vector.
	// We also assume that `Object.create(null)` is available when the event name
	// is an ES6 Symbol.
	//
	var prefix = typeof Object.create !== 'function' ? '~' : false;

	/**
	 * Representation of a single EventEmitter function.
	 *
	 * @param {Function} fn Event handler to be called.
	 * @param {Mixed} context Context for function execution.
	 * @param {Boolean} [once=false] Only emit once
	 * @api private
	 */
	function EE(fn, context, once) {
	  this.fn = fn;
	  this.context = context;
	  this.once = once || false;
	}

	/**
	 * Minimal EventEmitter interface that is molded against the Node.js
	 * EventEmitter interface.
	 *
	 * @constructor
	 * @api public
	 */
	function EventEmitter() { /* Nothing to set */ }

	/**
	 * Hold the assigned EventEmitters by name.
	 *
	 * @type {Object}
	 * @private
	 */
	EventEmitter.prototype._events = undefined;

	/**
	 * Return an array listing the events for which the emitter has registered
	 * listeners.
	 *
	 * @returns {Array}
	 * @api public
	 */
	EventEmitter.prototype.eventNames = function eventNames() {
	  var events = this._events
	    , names = []
	    , name;

	  if (!events) return names;

	  for (name in events) {
	    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
	  }

	  if (Object.getOwnPropertySymbols) {
	    return names.concat(Object.getOwnPropertySymbols(events));
	  }

	  return names;
	};

	/**
	 * Return a list of assigned event listeners.
	 *
	 * @param {String} event The events that should be listed.
	 * @param {Boolean} exists We only need to know if there are listeners.
	 * @returns {Array|Boolean}
	 * @api public
	 */
	EventEmitter.prototype.listeners = function listeners(event, exists) {
	  var evt = prefix ? prefix + event : event
	    , available = this._events && this._events[evt];

	  if (exists) return !!available;
	  if (!available) return [];
	  if (available.fn) return [available.fn];

	  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
	    ee[i] = available[i].fn;
	  }

	  return ee;
	};

	/**
	 * Emit an event to all registered event listeners.
	 *
	 * @param {String} event The name of the event.
	 * @returns {Boolean} Indication if we've emitted an event.
	 * @api public
	 */
	EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
	  var evt = prefix ? prefix + event : event;

	  if (!this._events || !this._events[evt]) return false;

	  var listeners = this._events[evt]
	    , len = arguments.length
	    , args
	    , i;

	  if ('function' === typeof listeners.fn) {
	    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

	    switch (len) {
	      case 1: return listeners.fn.call(listeners.context), true;
	      case 2: return listeners.fn.call(listeners.context, a1), true;
	      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
	      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
	      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
	      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
	    }

	    for (i = 1, args = new Array(len -1); i < len; i++) {
	      args[i - 1] = arguments[i];
	    }

	    listeners.fn.apply(listeners.context, args);
	  } else {
	    var length = listeners.length
	      , j;

	    for (i = 0; i < length; i++) {
	      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

	      switch (len) {
	        case 1: listeners[i].fn.call(listeners[i].context); break;
	        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
	        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
	        default:
	          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
	            args[j - 1] = arguments[j];
	          }

	          listeners[i].fn.apply(listeners[i].context, args);
	      }
	    }
	  }

	  return true;
	};

	/**
	 * Register a new EventListener for the given event.
	 *
	 * @param {String} event Name of the event.
	 * @param {Function} fn Callback function.
	 * @param {Mixed} [context=this] The context of the function.
	 * @api public
	 */
	EventEmitter.prototype.on = function on(event, fn, context) {
	  var listener = new EE(fn, context || this)
	    , evt = prefix ? prefix + event : event;

	  if (!this._events) this._events = prefix ? {} : Object.create(null);
	  if (!this._events[evt]) this._events[evt] = listener;
	  else {
	    if (!this._events[evt].fn) this._events[evt].push(listener);
	    else this._events[evt] = [
	      this._events[evt], listener
	    ];
	  }

	  return this;
	};

	/**
	 * Add an EventListener that's only called once.
	 *
	 * @param {String} event Name of the event.
	 * @param {Function} fn Callback function.
	 * @param {Mixed} [context=this] The context of the function.
	 * @api public
	 */
	EventEmitter.prototype.once = function once(event, fn, context) {
	  var listener = new EE(fn, context || this, true)
	    , evt = prefix ? prefix + event : event;

	  if (!this._events) this._events = prefix ? {} : Object.create(null);
	  if (!this._events[evt]) this._events[evt] = listener;
	  else {
	    if (!this._events[evt].fn) this._events[evt].push(listener);
	    else this._events[evt] = [
	      this._events[evt], listener
	    ];
	  }

	  return this;
	};

	/**
	 * Remove event listeners.
	 *
	 * @param {String} event The event we want to remove.
	 * @param {Function} fn The listener that we need to find.
	 * @param {Mixed} context Only remove listeners matching this context.
	 * @param {Boolean} once Only remove once listeners.
	 * @api public
	 */
	EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
	  var evt = prefix ? prefix + event : event;

	  if (!this._events || !this._events[evt]) return this;

	  var listeners = this._events[evt]
	    , events = [];

	  if (fn) {
	    if (listeners.fn) {
	      if (
	           listeners.fn !== fn
	        || (once && !listeners.once)
	        || (context && listeners.context !== context)
	      ) {
	        events.push(listeners);
	      }
	    } else {
	      for (var i = 0, length = listeners.length; i < length; i++) {
	        if (
	             listeners[i].fn !== fn
	          || (once && !listeners[i].once)
	          || (context && listeners[i].context !== context)
	        ) {
	          events.push(listeners[i]);
	        }
	      }
	    }
	  }

	  //
	  // Reset the array, or remove it completely if we have no more listeners.
	  //
	  if (events.length) {
	    this._events[evt] = events.length === 1 ? events[0] : events;
	  } else {
	    delete this._events[evt];
	  }

	  return this;
	};

	/**
	 * Remove all listeners or only the listeners for the specified event.
	 *
	 * @param {String} event The event want to remove all listeners for.
	 * @api public
	 */
	EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
	  if (!this._events) return this;

	  if (event) delete this._events[prefix ? prefix + event : event];
	  else this._events = prefix ? {} : Object.create(null);

	  return this;
	};

	//
	// Alias methods names because people roll like that.
	//
	EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
	EventEmitter.prototype.addListener = EventEmitter.prototype.on;

	//
	// This function doesn't apply anymore.
	//
	EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
	  return this;
	};

	//
	// Expose the prefix.
	//
	EventEmitter.prefixed = prefix;

	//
	// Expose the module.
	//
	if (true) {
	  module.exports = EventEmitter;
	}


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _base = __webpack_require__(4);

	var _base2 = _interopRequireDefault(_base);

	var _map = __webpack_require__(5);

	var _map2 = _interopRequireDefault(_map);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Created by wanghx on 4/27/16.
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * food
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

	var Food = function (_Base) {
	  _inherits(Food, _Base);

	  function Food(options) {
	    _classCallCheck(this, Food);

	    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Food).call(this, options));

	    _this.point = options.point;
	    _this.lightSize = _this.width / 2; // 食物的半径, 发光半径
	    _this.lightDirection = true; // 发光动画方向
	    return _this;
	  }

	  _createClass(Food, [{
	    key: 'update',
	    value: function update() {
	      var lightSpeed = 1;

	      this.lightSize += this.lightDirection ? lightSpeed : -lightSpeed;

	      // 当发光圈到达一定值再缩小
	      if (this.lightSize > this.width || this.lightSize < this.width / 2) {
	        this.lightDirection = !this.lightDirection;
	      }
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      if (!this.visible) {
	        return;
	      }

	      this.update();

	      _map2.default.ctx.fillStyle = '#fff';

	      // 绘制光圈
	      _map2.default.ctx.globalAlpha = 0.2;
	      _map2.default.ctx.beginPath();
	      _map2.default.ctx.arc(this.paintX, this.paintY, this.lightSize * this.paintWidth / this.width, 0, Math.PI * 2);
	      _map2.default.ctx.fill();

	      // 绘制实体
	      _map2.default.ctx.globalAlpha = 1;
	      _map2.default.ctx.beginPath();
	      _map2.default.ctx.arc(this.paintX, this.paintY, this.paintWidth / 2, 0, Math.PI * 2);
	      _map2.default.ctx.fill();
	    }
	  }]);

	  return Food;
	}(_base2.default);

	exports.default = Food;

/***/ }
/******/ ]);