/**
 * Created by wanghx on 5/3/16.
 *
 * webpack.dist
 *
 */

const webpack = require('webpack');
const config = require('./webpack.base');

module.exports = {
  entry: config.entry,
  output: config.output,

  plugins: config.plugins.concat([
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        dead_code: true,
        screw_ie8: true,
        unused: true,
        warnings: false
      }
    })
  ]),

  module: config.module,
  resolve: config.resolve
};