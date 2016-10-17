'use strict';

var structs = {
  snake: ['id', 'angle', 'size', 'x', 'y', 'bodys'],
  food: ['id', 'coords']
};

var lengthMap = {
  opt: 1,
  data: 2
};

exports.objToArray = function(obj, type) {
  var struct = structs[type];
  var arr = [];

  if (!struct) {
    return arr;
  }

  struct.forEach(function(key, i) {
    if (i === struct.length - 1) {
      arr = arr.concat(obj[key] || []);
    } else {
      arr.push(obj[key] || 0);
    }
  });

  return arr;
};

exports.arrayToObj = function(arr, type) {
  var struct = structs[type];
  var obj = {};

  if (!struct) {
    return obj;
  }

  struct.forEach(function(key, i) {
    if (i === struct.length - 1) {
      obj[key] = arr.slice(i);
    } else {
      obj[key] = arr[i];
    }
  });

  return obj;
};

Uint8Array.prototype.setUint = function(value, offset, byteLength) {
  value = +value;
  offset = offset >>> 0;
  byteLength = byteLength >>> 0;
  var i = byteLength - 1;
  var mul = 1;
  this[offset + i] = value;
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) >>> 0;
  }

  return offset + byteLength;
};

Uint8Array.prototype.getUint = function(offset, byteLength) {
  offset = offset >>> 0;
  byteLength = byteLength >>> 0;
  var val = this[offset + --byteLength];
  var mul = 1;
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul;
  }
  return val;
};

// allocate buffer and return a dataview
var allocate = (function() {
  if (!Buffer || !Buffer.allocate) {
    var poolSize = 8 * 1024;
    var allocPool, poolOffset;

    var createArrayBuffer = function(size) {
      return new ArrayBuffer(size);
    };

    var createPool = function() {
      allocPool = createArrayBuffer(poolSize);
      poolOffset = 0;
    };

    var createBuf = function(arraybuffer, offset, length) {
      return new Uint8Array(arraybuffer, offset, length);
    };

    createPool();

    return function(size) {
      if (size < poolSize) {
        if (size > (poolSize - poolOffset)) { poolOffset = 0; }
        var dv = createBuf(allocPool, poolOffset, size);
        poolOffset += size;
        return dv;
      } else {
        return createBuf(createArrayBuffer(size), 0, size);
      }
    };
  } else {
    Buffer.poolSize = 100 * 1024;
    return function(size) {
      return Buffer.allocate(size);
    };
  }
})();

// encode bitmap to binary data
exports.encode = function(bitmap) {
  var buflen = lengthMap.opt + bitmap.data.length * lengthMap.data;
  var buf = allocate(buflen);
  buf[0] = bitmap.opt;
  bitmap.data.forEach(function(value, i) {
    buf.setUint(value, i * lengthMap.data + lengthMap.opt, 2);
  });
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buflen);
};

// decode binary data to bitmap
exports.decode = function(buf) {
  var bitmap = {};

  // buf may be node buffer
  if (!ArrayBuffer.isView(buf)) {
    buf = new Uint8Array(buf);
  }

  bitmap.opt = buf[0];
  bitmap.data = [];
  for (var i = lengthMap.opt, max = buf.byteLength - lengthMap.opt; i < max; i += lengthMap.data) {
    bitmap.data.push(buf.getUint(i, 2));
  }
  return bitmap;
};

// var test = exports.objToArray({
//   id: 1,
//   angle: 100,
//   y: 100,
//   bodys: [1, 2, 3]
// }, 'snake'); 

// console.log(test);

// console.log(exports.arrayToObj(test, 'snake'));

// console.log(exports.decode(exports.encode({
//   opt: 1,
//   data: [2, 3]
// })));