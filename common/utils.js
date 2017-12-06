'use strict';

const OPT_LEN = 1;
const PACKET_TYPE_LEN = 1;
exports.SNAKE_TYPE = 1;
exports.FOOD_TYPE = 2;
exports.VIEW_TYPE = 3;
exports.AREA_TYPE = 4;

const floatType = {
  byteLen: 3,
  encode: value => ~~(value * 100),
  decode: value => value / 100
};

const packetTypes = {
  [exports.SNAKE_TYPE]: {
    id: { byteLen: 2 },
    angle: { byteLen: 2 },
    size: { byteLen: 2 },
    speed: { byteLen: 1 },
    length: { byteLen: 2 },
    x: floatType,
    y: floatType,
  },

  [exports.FOOD_TYPE]: {
    x: floatType,
    y: floatType,
  },

  [exports.VIEW_TYPE]: {
    width: { byteLen: 2 },
    height: { byteLen: 2 },
  },
};

const packetLenMap = {};
for (const pkey in packetTypes) {
  const packet = packetTypes[pkey];
  packetLenMap[pkey] = 0;
  for (const key in packet) {
    packetLenMap[pkey] += packet[key].byteLen;
  }
}

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

    const createArrayBuffer = size => {
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

    return size => {
      if (size < poolSize) {
        if (size > poolSize - poolOffset) {
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
    return size => {
      return Buffer.allocate(size);
    };
  }
})();

// encode data to binary data
// { 
//   opt: 1,
//   data: [{
//     type: 1,
//     packet: {
//       x: data.x,
//       y: data.y,
//       angle: data.angle * Math.PI / 180,
//       size: data.size,
//     }
//   }] 
// }
exports.encode = ({ opt, data }) => {
  data = Array.isArray(data) ? data : [data];
  let bufLen = OPT_LEN;

  // calculate buffer length
  data.forEach(item => {
    const packetType = packetTypes[item.type];
    const packetDataLen = packetLenMap[item.type] + PACKET_TYPE_LEN;
    bufLen += packetDataLen;
  });

  const buf = allocate(bufLen);
  buf[0] = opt;

  // set buffer
  let offset = OPT_LEN;
  data.forEach(item => {
    const packetType = packetTypes[item.type];
    buf.setUint(item.type, offset, PACKET_TYPE_LEN);
    offset += PACKET_TYPE_LEN;
    for (const key in packetType) {
      let value = +item.packet[key] || 0;
      const packetItem = packetType[key];
      const byteLength = packetItem.byteLen;
      if (packetItem.encode) {
        value = packetItem.encode(value);
      }
      buf.setUint(value, offset, byteLength);
      offset += byteLength;
    }
  });

  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + bufLen);
};

// decode binary data to json
exports.decode = buf => {
  const json = {};

  // buf may be node buffer
  if (!ArrayBuffer.isView(buf)) {
    buf = new Uint8Array(buf);
  }

  json.opt = buf[0];
  json.data = [];

  const max = buf.byteLength - OPT_LEN;
  let i = OPT_LEN;
  while (i < max) {
    const type = buf[i];
    const packetType = packetTypes[type];
    const data = {};
    i += PACKET_TYPE_LEN;

    for (const key in packetType) {
      const packetItem = packetType[key];
      const byteLen = packetItem.byteLen;
      const value = buf.getUint(i, byteLen);
      data[key] = packetItem.decode 
        ? packetItem.decode(value)
        : value;
      i += byteLen;
    }

    json.data.push({
      type, packet: data,
    });
  }

  return json;
};
 
// const data = { 
//   opt: 1,
//   data: [{
//     type: 1,
//     packet: {
//       x: 1000.33,
//       y: 669,
//       angle: 180,
//       size: 80,
//     }
//   }, {
//     type: 1,
//     packet: {
//       x: 10020,
//       y: 889,
//       angle: 180,
//       size: 80,
//     }
//   }]
// };
// const buf = exports.encode(data);

// console.log(exports.decode(buf));