'use strict';
const webpack = require('webpack');
const ip = require('ip').address();
const WebpackDevServer = require('webpack-dev-server');
const merge = require('webpack-merge');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const config = require('../common/config');
const webpackConfig = require('./webpack.base');

webpackConfig.entry.main.push(
  `webpack-dev-server/client/?http://${ip}:${config.devPort}`,
  'webpack/hot/dev-server'
);

const compiler = webpack(
  merge(webpackConfig, {
    devtool: 'eval-cheap-module-source-map',
    output: { publicPath: '/' },
    plugins: [new webpack.HotModuleReplacementPlugin()],
  })
);

new WebpackDevServer(compiler, {
  hot: true,
  disableHostCheck: true,
  compress: true,
  stats: {
    colors: true,
    chunks: false,
    modules: false,
    children: false,
    chunkModules: false,
    chunkOrigins: false,
    cachedAssets: false,
  },
}).listen(config.devPort);
