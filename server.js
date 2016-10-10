const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('./webpack.base');
const http = require('http');
const fs = require('fs');
const os = require('os');
const ip = getIp();
const port = 9999;
const devport = port - 1;
const domain = `http://${ip}:${devport}`;

const server = new WebpackDevServer(webpack({
  devtool: 'eval',
  entry: {
    main: [
      'webpack/hot/only-dev-server',
      `webpack-dev-server/client?${domain}`,
      config.entry.main
    ]
  },
  output: config.output,
  plugins: config.plugins.concat([
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ]),
  module: config.module,
  resolve: config.resolve,
}), {
  publicPath: `${domain}/static/`,
  hot: true,
  historyApiFallback: true,
  port: devport,
  stats: {
    colors: true,
    chunks: false,
  },
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  }
});

http.createServer((req, res) => {
  res.writeHead(200, {
    'content-type': 'text/html;charset=utf-8'
  });

  res.end(
    fs.readFileSync('./index.html')
      .toString()
      .replace(/\.\/dist\//g, `${domain}/static/`)
  );
}).listen(port);

server.listen(devport);

function getIp() {
  'use strict';

  const interfaces = os.networkInterfaces();
  let IPv4 = '127.0.0.1';

  for (let key in interfaces) {
    interfaces[key].forEach(function(details) {
      if (details.family == 'IPv4' && (key == 'en0' || key == 'eth0')) {
        IPv4 = details.address;
      }
    });
  }

  return IPv4;
}