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
/***/ function(module, exports) {

	eval("/**\n * Created by wanghx on 4/23/16.\n *\n * main\n *\n */\n'use strict';\n\nimport Stats from './third/stats.min';\nimport Snake from './lib/snake';\nimport frame from './lib/frame';\nimport map from './lib/map';\n\nconst RAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {\n  window.setTimeout(callback, 1000 / 60);\n};\n\nconst canvas = document.getElementById('cas');\ncanvas.width = window.innerWidth;\ncanvas.height = window.innerHeight;\n\n// fps状态\nconst stats = new Stats();\nstats.setMode(0);\nstats.domElement.style.position = 'absolute';\nstats.domElement.style.right = '0px';\nstats.domElement.style.top = '0px';\ndocument.body.appendChild(stats.domElement);\n\n// 初始化地图对象\nmap.init({\n  canvas,\n  width: 3000,\n  height: 3000\n});\n\n// 初始化视窗对象\nframe.init({\n  x: 1000,\n  y: 1000,\n  width: canvas.width,\n  height: canvas.height\n});\n\n// 创建蛇类对象\nconst snake = new Snake({\n  x: frame.x + frame.width / 2,\n  y: frame.y + frame.height / 2,\n  size: 80,\n  length: 60,\n  color: '#fff'\n});\n\n// 动画逻辑\nlet time = new Date(),\n    timeout = 0;\nfunction animate() {\n  const ntime = new Date();\n\n  if (ntime - time > timeout) {\n    map.clear();\n\n    // 让视窗跟随蛇的位置更改而更改\n    frame.trace(snake);\n\n    map.render();\n\n    snake.render();\n\n    time = ntime;\n  }\n\n  stats.update();\n\n  RAF(animate);\n}\n\n/**\n * 事件绑定\n */\nfunction binds() {\n  window.onmousemove = function (e) {\n    e = e || window.event;\n\n    snake.moveTo(frame.x + e.clientX, frame.y + e.clientY);\n  };\n\n  window.onmousedown = function () {\n    snake.speedUp();\n  };\n\n  window.onmouseup = function () {\n    snake.speedDown();\n  };\n}\n\nbinds();\nanimate();\n\n/*****************\n ** WEBPACK FOOTER\n ** ./src/main.js\n ** module id = 1\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///./src/main.js?");

/***/ }
/******/ ]);