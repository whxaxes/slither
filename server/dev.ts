import child_process from 'child_process';
import chokidar from 'chokidar';
import ip from 'ip';
import path from 'path';
const address = ip.address();
let timeout;
let serverProcess: child_process.ChildProcess;

// start building
const buildProcess = child_process.spawn('npm', ['run', 'build'], {
  env: {
    ...process.env,
    LOCAL_IP: address,
  },
  stdio: [0, 1, 2],
});

startServerProcess();

// watch file change and restart server
const watcher = chokidar
  .watch([path.resolve(__dirname, './'), path.resolve(__dirname, '../web/common')])
  .on('add', startServerProcess)
  .on('change', startServerProcess)
  .on('unlink', startServerProcess);

function startServerProcess(f?: string) {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    if (f) {
      console.info(f + ' changed, restart server...');
    }

    if (serverProcess && !serverProcess.killed) {
      serverProcess.kill('SIGINT');
    }

    serverProcess = child_process.spawn(
      'node',
      ['--require', 'ts-node/register', path.resolve(__dirname, './index.ts')],
      {
        stdio: [0, 1, 2],
      },
    );

    serverProcess.on('error', () => {
      console.info('server error, restart now');
      setTimeout(startServerProcess, 2000);
    });
  }, 1000);
}

function close() {
  watcher.close();

  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill('SIGINT');
  }

  if (buildProcess && !buildProcess.killed) {
    buildProcess.kill('SIGINT');
  }
}

process.on('exit', close);
process.on('SIGINT', close);
process.on('SIGTERM', close);
process.on('SIGHUP', close);
