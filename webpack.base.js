/**
 * Created by wanghx on 5/3/16.
 *
 * webpack.base.js
 *
 */

const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    main: ['./src/main']
  },

  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },

  plugins: [
    new webpack.NoErrorsPlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      template: 'src/index.html',
    })
  ],

  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      include: path.join(__dirname, 'src')
    }]
  },

  resolve: {
    extensions: ['', '.js'],
    alias: {
      'config': path.resolve('./config')
    }
  }
};