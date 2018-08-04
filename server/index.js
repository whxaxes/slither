'use strict';

require('./game');

const http = require('http');
const child_process = require('child_process');
const path = require('path');
const fs = require('fs');
const ip = require('ip').address();
const isProd = process.env.NODE_ENV === 'production';

// start the building
if (!isProd) {
  child_process.spawn('npm', ['run', 'build'], {
    env: {
      ...process.env,
      LOCAL_IP: ip,
    },
    stdio: [0, 1, 2],
  });
} else {
  http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write(fs.readFileSync(path.resolve(__dirname, './dist/index.html')));
  });
}
