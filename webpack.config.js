const path = require('path');
const webpack = require('webpack');
const fs = require('fs');

module.exports = {
  devtool: 'eval',

  entry: {
    main: ['./src/main']
  },

  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },

  plugins: [
    //new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],

  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel'],
        include: path.join(__dirname, 'src')
      }
    ]
  },

  resolve: {
    extensions: ['', '.js']
  }
};