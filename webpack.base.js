/**
 * Created by wanghx on 5/3/16.
 *
 * webpack.base.js
 *
 */

const path = require('path');

module.exports = {
  entry: {
    main: './src/main'
  },

  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },

  plugins: [],

  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        include: path.join(__dirname, 'src')
      }
    ]
  },

  resolve: {
    extensions: ['', '.js']
  }
};