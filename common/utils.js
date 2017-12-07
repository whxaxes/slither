'use strict';

if (typeof window !== 'undefined') {
  window.Buffer = require('buffer/').Buffer;
}

const OPT_LEN = 1;
const PACKET_TYPE_LEN = 1;
exports.SNAKE_TYPE = 1;
exports.FOOD_TYPE = 2;
exports.VIEW_TYPE = 3;
exports.AREA_TYPE = 4;
exports.SNAKE_BODY_TYPE = 5;

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
    body: {
      byteLen: 2,
    }
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

Buffer.poolSize = 100 * 1024;

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
const allocLen = 1024;
exports.encode = ({ opt, data }) => {
  const bufList = [];
  let byteLen = 0;
  let offset = 0;

  data = Array.isArray(data) ? data : [data];
  let buf = Buffer.alloc(allocLen);
  bufList.push(buf);

  const writeUInt = (value, byteLength) => {
    byteLen += byteLength;
    let remain = allocLen - offset;
    if (remain < byteLength) {
      if (remain) {
        // split buffer
        byteLength -= remain;
        const i = Math.pow(2, byteLength * 8);
        const l = (value / i) >>> 0;
        value -= l * i;
        buf.writeUIntBE(l, offset, remain);
      }

      buf = Buffer.alloc(allocLen);
      bufList.push(buf);
      offset = 0;
    }

    buf.writeUIntBE(value, offset, byteLength);
    offset += byteLength;
  };

  writeUInt(opt, OPT_LEN);

  // set buffer
  data.forEach(item => {
    const packetType = packetTypes[item.type];
    writeUInt(item.type, PACKET_TYPE_LEN);

    for (const key in packetType) {
      let value = +item.packet[key] || 0;
      const packetItem = packetType[key];
      const byteLength = packetItem.byteLen;
      if (packetItem.encode) {
        value = packetItem.encode(value);
      }
      writeUInt(value, byteLength);
    }
  });

  if (bufList.length > 1) {
    buf = Buffer.concat(bufList, bufList.length * allocLen);
  }

  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + byteLen);
};

// decode binary data to json
exports.decode = buf => {
  const json = {};

  // buf may be node buffer
  if (!ArrayBuffer.isView(buf)) {
    buf = Buffer.from(buf);
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
      const value = buf.readUIntBE(i, byteLen);
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
 
const data = { 
  opt: 1,
  data: [{
    type: 1,
    packet: {
      x: 1000.33,
      y: 669,
      angle: 180,
      size: 80,
    }
  }, {
    type: 1,
    packet: {
      x: 10020,
      y: 889,
      angle: 180,
      size: 80,
    }
  }]
};
const buf = exports.encode(data);

console.log(buf);
console.log(exports.decode(buf));