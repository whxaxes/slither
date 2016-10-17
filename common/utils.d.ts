type structType = 'snake' | 'food';

export interface Struct {
  id?: number;
  angle?: number;
  size?: number;
  x?: number;
  y?: number;
  bodys?: number[]
}

export interface Bitmap {
  opt: number;
  data: Array<number>
}

export const objToArray: (obj: Struct, type: structType) => number[];
export const arrayToObj: (arr: number[], type: structType) => Struct;

export const encode: (bitmap: Bitmap) => ArrayBuffer;
export const decode: (buf: ArrayBuffer | Uint8Array) => Bitmap; 