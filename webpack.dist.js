/**
 * Created by wanghx on 5/3/16.
 *
 * webpack.dist
 *
 */

const webpack = require('webpack');
const merge = require('webpack-merge');
const config = require('./webpack.base');

module.exports = merge(require('./webpack.base'), {
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        dead_code: true,
        screw_ie8: true,
        unused: true,
        warnings: false
      }
    })
  ]
});