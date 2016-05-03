const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const http = require('http');
const fs = require('fs');

const port = 9999;
const webpackPort = port + 1;

const config = require('./webpack.config.js');

config.devtool = 'eval';

Object.keys(config.entry).forEach(key => {
  config.entry[key].unshift(
    'webpack/hot/only-dev-server',
    `webpack-dev-server/client?http://localhost:${webpackPort}`
  );
});

config.output.publicPath = `http://localhost:${webpackPort}/static/`;
config.plugins.unshift(
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin()
);

const compiler = webpack(config);

const server = new WebpackDevServer(compiler, {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true,
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  }
});

http.createServer((req, res) => {
  res.writeHead(200, {
    'content-type': 'text/html;charset=utf-8'
  });

  res.end(
    fs.readFileSync('./index.html')
      .toString()
      .replace(/\.\/dist\//g, `http://localhost:${webpackPort}/static/`)
  );
}).listen(port);

server.listen(webpackPort);