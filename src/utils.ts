/**
 * 工具封装
 */

enum DataLength {
  opt = 1,
  value = 2
};

export interface EncodeData {
  opt: number;
  data: number[];
}

/**将数据encode */
export function encode(data: EncodeData): ArrayBuffer {
  // 操作符1个字节，单个数值两个字节
  const bufLen = DataLength.opt + data.data.length * DataLength.value;
  const buf = new ArrayBuffer(bufLen);
  const dv = new DataView(buf);
  dv.setInt8(0, data.opt);
  data.data.forEach((value, i) => {
    dv.setUint16(i * DataLength.value + DataLength.opt, Math.abs(value));
  });
  return buf;
}

/**将数据decode */
export function decode(buf: ArrayBuffer): EncodeData {
  const dv = new DataView(buf);
  const data = <EncodeData>{};
  data.opt = dv.getUint8(0);
  data.data = [];
  for (let i = DataLength.opt, max = buf.byteLength - DataLength.opt; i < max; i += DataLength.value) {
    data.data.push(dv.getUint16(i));
  }
  return data;
}