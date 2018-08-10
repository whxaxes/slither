import child_process from 'child_process';
import ip from 'ip';
import { startServer } from './game';
const address = ip.address();

// start building
child_process.spawn('npm', ['run', 'build'], {
  env: {
    ...process.env,
    LOCAL_IP: address,
  },
  stdio: [0, 1, 2],
});

startServer();
