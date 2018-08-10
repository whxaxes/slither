'use strict';

import { Buffer } from 'buffer';

const OPT_LEN = 1;
const PACKET_TYPE_LEN = 1;
export const SNAKE_TYPE = 1;
export const FOOD_TYPE = 2;
export const VIEW_TYPE = 3;
export const AREA_TYPE = 4;
export const SNAKE_BODY_TYPE = 5;

const floatType = {
  byteLen: 3,
  encode: (value) => ~~(value * 100),
  decode: (value) => value / 100,
};

const packetTypes = {
  [SNAKE_TYPE]: {
    id: { byteLen: 2 },
    angle: { byteLen: 2 },
    size: { byteLen: 2 },
    speed: { byteLen: 1 },
    length: { byteLen: 2 },
    x: floatType,
    y: floatType,
  },

  [FOOD_TYPE]: {
    x: floatType,
    y: floatType,
  },

  [VIEW_TYPE]: {
    width: { byteLen: 2 },
    height: { byteLen: 2 },
  },
};

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
(Buffer as any).poolSize = 100 * 1024;
const allocLen = 1024;
export function encode({ opt, data }) {
  const bufList: Buffer[] = [];
  let byteLen = 0;
  let offset = 0;

  data = Array.isArray(data) ? data : [data];
  let buf = Buffer.alloc(allocLen);
  bufList.push(buf);

  const writeUInt = (value, byteLength) => {
    byteLen += byteLength;
    const less = allocLen - offset;
    if (less < byteLength) {
      if (less) {
        // split buffer
        byteLength -= less;
        const i = Math.pow(2, byteLength * 8);
        const l = (value / i) >>> 0;
        value -= l * i;
        buf.writeUIntBE(l, offset, less);
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
  data.forEach((item) => {
    const packetType = packetTypes[item.type];
    writeUInt(item.type, PACKET_TYPE_LEN);

    for (const key in packetType) {
      if (packetType.hasOwnProperty(key)) {
        let value = +item.packet[key] || 0;
        const packetItem = packetType[key];
        const byteLength = packetItem.byteLen;
        if (packetItem.encode) {
          value = packetItem.encode(value);
        }
        writeUInt(value, byteLength);
      }
    }
  });

  if (bufList.length > 1) {
    buf = Buffer.concat(bufList, bufList.length * allocLen);
  }

  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + byteLen);
}

// decode binary data to json
export function decode(buf) {
  const json = {} as any;

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
      if (packetType.hasOwnProperty(key)) {
        const packetItem = packetType[key];
        const byteLen = packetItem.byteLen;
        const value = buf.readUIntBE(i, byteLen);
        data[key] = packetItem.decode ? packetItem.decode(value) : value;
        i += byteLen;
      }
    }

    json.data.push({
      type,
      packet: data,
    });
  }

  return json;
}
