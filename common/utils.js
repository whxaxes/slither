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

    var createDv = function(arraybuffer, offset, length) {
      return new DataView(arraybuffer, offset, length);
    };

    createPool();

    return function(size) {
      if (size < poolSize) {
        if (size > poolSize - poolOffset) createPool();
        var dv = createDv(allocPool, poolOffset, poolOffset + size);
        poolOffset += size;
        return dv;
      } else {
        return createDv(createArrayBuffer(size), 0, size);
      }
    };
  } else {
    return function(size) {
      var fastbuf = Buffer.allocate(size);
      return new DataView(fastbuf.buffer, fastbuf.byteOffset, fastbuf.byteLength);
    };
  }
})();


// encode bitmap to binary data
exports.encode = function(bitmap) {
  var buflen = lengthMap.opt + bitmap.data.length * lengthMap.data;
  var dv = allocate(buflen);
  dv.setInt8(dv.byteOffset, bitmap.opt);
  bitmap.data.forEach(function(value, i) {
    dv.setUint16(dv.byteOffset + i * lengthMap.data + lengthMap.opt, Math.abs(value));
  });
  return dv.buffer;
};

// decode binary data to bitmap
exports.decode = function(buf) {
  var dv;
  var bitmap = {};

  // buf may be node buffer
  if (ArrayBuffer.isView(buf)) {
    dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  } else {
    dv = new DataView(buf);
  }

  bitmap.opt = dv.getUint8(0);
  bitmap.data = [];
  for (var i = lengthMap.opt, max = buf.byteLength - lengthMap.opt; i < max; i += lengthMap.data) {
    bitmap.data.push(dv.getUint16(i));
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