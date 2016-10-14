const webpack = require('webpack');
const merge = require('webpack-merge');
const config = require('./webpack.config');

module.exports = merge(config, {
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        dead_code: true,
        unused: true,
        warnings: false
      }
    })
  ]
});