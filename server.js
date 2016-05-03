const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const http = require('http');
const fs = require('fs');

const config = require('./webpack.dev.js');
const compiler = webpack(config);
const server = new WebpackDevServer(compiler, config.devServer);
const port = config.devServer.port + 1;

http.createServer((req, res) => {
  res.writeHead(200, {
    'content-type': 'text/html;charset=utf-8'
  });

  res.end(
    fs.readFileSync('./index.html')
      .toString()
      .replace(/\.\/dist\//g, `http://localhost:${config.devServer.port}/static/`)
  );
}).listen(port);

server.listen(config.devServer.port);