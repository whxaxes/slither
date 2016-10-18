'use strict';

const structs = {
  snake: ['id', 'angle', 'size', 'x', 'y', 'bodys'],
  food: ['id', 'coords']
};

const lengthMap = {
  opt: 1,
  data: 2
};

exports.objToArray = (obj, type) => {
  let arr = [];
  let struct = structs[type];

  if (!struct) {
    return arr;
  }

  struct.forEach((key, i) => {
    if (i === struct.length - 1) {
      arr = arr.concat(obj[key] || []);
    } else {
      arr.push(obj[key] || 0);
    }
  });

  return arr;
};

exports.arrayToObj = (arr, type) => {
  const struct = structs[type];
  const obj = {};

  if (!struct) {
    return obj;
  }

  struct.forEach((key, i) => {
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
  let i = byteLength - 1;
  let mul = 1;
  this[offset + i] = value;
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) >>> 0;
  }
  return offset + byteLength;
};

Uint8Array.prototype.getUint = function(offset, byteLength) {
  offset = offset >>> 0;
  byteLength = byteLength >>> 0;
  let val = this[offset + --byteLength];
  let mul = 1;
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul;
  }
  return val;
};

// allocate buffer and return a dataview
const allocate = (() => {
  if (!Buffer || !Buffer.allocate) {
    const poolSize = 24 * 1024;
    let allocPool, poolOffset;

    const createArrayBuffer = (size) => {
      return new ArrayBuffer(size);
    };

    const createPool = () => {
      allocPool = createArrayBuffer(poolSize);
      poolOffset = 0;
    };

    const createBuf = (arraybuffer, offset, length) => {
      return new Uint8Array(arraybuffer, offset, length);
    };

    createPool();

    return (size) => {
      if (size < poolSize) {
        if (size > (poolSize - poolOffset)) {
          poolOffset = 0;
        }
        const buf = createBuf(allocPool, poolOffset, size);
        poolOffset += size;
        return buf;
      } else {
        return createBuf(createArrayBuffer(size), 0, size);
      }
    };
  } else {
    Buffer.poolSize = 100 * 1024;
    return (size) => {
      return Buffer.allocate(size);
    };
  }
})();

// encode bitmap to binary data
exports.encode = (bitmap) => {
  const buflen = lengthMap.opt + bitmap.data.length * lengthMap.data;
  const buf = allocate(buflen);
  buf[0] = bitmap.opt;
  bitmap.data.forEach((value, i) => {
    buf.setUint(value, i * lengthMap.data + lengthMap.opt, lengthMap.data);
  });
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buflen);
};

// decode binary data to bitmap
exports.decode = (buf) => {
  const bitmap = {};

  // buf may be node buffer
  if (!ArrayBuffer.isView(buf)) {
    buf = new Uint8Array(buf);
  }

  bitmap.opt = buf[0];
  bitmap.data = [];
  for (let i = lengthMap.opt, max = buf.byteLength - lengthMap.opt; i < max; i += lengthMap.data) {
    bitmap.data.push(buf.getUint(i, lengthMap.data));
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