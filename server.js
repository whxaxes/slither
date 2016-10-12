'use strict';
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const merge = require('webpack-merge');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const config = require('./config');

const localIp = getIp();
const outputDomain = `http://${localIp}:${config.devPort}`;
const webpackConfig = merge(require('./webpack.base'), {
  devtool: 'eval',
  output: {
    publicPath: `${outputDomain}/static/`,
  },
  entry: {
    vendor: [
      'webpack/hot/only-dev-server',
      `webpack-dev-server/client?${outputDomain}`,
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
});

const compiler = webpack(webpackConfig);

new WebpackDevServer(compiler, {
  publicPath: `${outputDomain}/static/`,
  hot: true,
  historyApiFallback: true,
  stats: {
    colors: true,
    chunks: false,
  },
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  }
}).listen(config.devPort);

http.createServer((req, res) => {
  const cfs = compiler.outputFileSystem;
  const html = cfs.readFileSync(path.join(compiler.outputPath, 'index.html')).toString();
  res.writeHead(200, { 'content-type': 'text/html;charset=utf-8' });
  res.end(html.replace(/{{ *ip *}}/gi, localIp));
}).listen(config.port);

function getIp() {
  const interfaces = os.networkInterfaces();
  let IPv4 = '127.0.0.1';

  for (let key in interfaces) {
    interfaces[key].forEach((details) => {
      if (details.family == 'IPv4' && (key == 'en0' || key == 'eth0')) {
        IPv4 = details.address;
      }
    });
  }

  return IPv4;
}