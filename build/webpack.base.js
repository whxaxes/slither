const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

module.exports = {
  entry: {
    main: [ './src/main.ts' ],
  },

  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },

  plugins: [
    new webpack.WatchIgnorePlugin([
      /\.d\.ts$/,
    ]),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/index.html',
    }),
    new ProgressBarPlugin({
      width: 100,
      format: 'Building [:bar] (:percent) (:elapsed seconds)',
      clear: false,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [ 'babel-loader?presets=es2015' ],
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
      },
    ],
  },

  resolve: {
    extensions: ['.js', '.ts'],
    alias: {
      '~': path.resolve(__dirname, '../src/'),
      'common': path.resolve(__dirname, '../common/')
    }
  },
};
