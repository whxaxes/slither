'use strict';
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const merge = require('webpack-merge');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const config = require('./common/config');
const webpackConfig = require('./webpack.config');

const localIp = getIp();
const outputDomain = `http://${localIp}:${config.devPort}`;
const publicPath = `${outputDomain}/static/`;
const compiler = webpack(merge(webpackConfig, {
  devtool: 'eval-cheap-module-source-map',
  output: {
    publicPath,
  },
  entry: {
    vendor: [
      'stats.js',
      'eventemitter3',
      'es6-shim',
      'webpack/hot/only-dev-server',
      `webpack-dev-server/client?${outputDomain}`,
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: ['main', 'vendor']
    })
  ],
  module: {
    preLoaders: [{
      test: /\.js$/,
      loader: 'source-map-loader'
    }]
  }
}));

new WebpackDevServer(compiler, {
  publicPath,
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

  Object.keys(interfaces).forEach(key => {
    for (let i = 0; i < interfaces[key].length; i++) {
      const details = interfaces[key][i];
      if (details.family == 'IPv4' && (key == 'en0' || key == 'eth0')) {
        IPv4 = details.address;
        return;
      }
    }
  });

  return IPv4;
}