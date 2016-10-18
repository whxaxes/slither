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
    main: [
      './src/main.ts'
    ]
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
      include: path.resolve('./common'),
      loaders: [
        'babel-loader?presets=es2015'
      ]
    }, {
      test: /\.ts$/,
      include: path.resolve('./src'),
      loaders: [
        'awesome-typescript-loader'
      ]
    }]
  },

  resolve: {
    extensions: ['', '.js', '.ts']
  }
};