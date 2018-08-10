import 'ws';

declare module 'ws' {
  interface WebSocket {
    [key: string]: any;
  }
}