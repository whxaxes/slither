const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    main: ['./src/main.ts'],
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
      inject: true,
      template: 'src/index.html',
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
