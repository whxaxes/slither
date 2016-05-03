const webpack = require('webpack');
const config = require('./webpack.base');
const devPort = 9998;

module.exports = {
  devtool: 'eval',

  entry: {
    main: [
      'webpack/hot/only-dev-server',
      `webpack-dev-server/client?http://localhost:${devPort}`,
      config.entry.main
    ]
  },

  output: config.output,

  plugins: config.plugins.concat([
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ]),

  module: config.module,
  resolve: config.resolve,

  devServer: {
    publicPath: `http://localhost:${devPort}/static/`,
    hot: true,
    historyApiFallback: true,
    port: devPort,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000
    }
  }
};