const path = require('path');
const webpack = require('webpack');

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
    // new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],

  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        include: path.join(__dirname, 'src'),
        query: {
          presets: ['es2015']
        }
      }
    ]
  },

  resolve: {
    extensions: ['', '.js']
  }
};