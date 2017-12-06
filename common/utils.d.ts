export const SNAKE_TYPE: number;
export const FOOD_TYPE: number;
export const VIEW_TYPE: number;
export const AREA_TYPE: number;

export const encode: (bitmap: any) => ArrayBuffer;
export const decode: (buf: ArrayBuffer | Uint8Array) => Bitmap; 