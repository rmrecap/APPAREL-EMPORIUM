const path = require('path');
const { spawn } = require('child_process');

process.env.NODE_ENV = 'production';
const port = process.env.PORT || '3000';
const hostname = process.env.HOSTNAME || '127.0.0.1';

console.log(`[BOOT] Launching Next.js production server on http://${hostname}:${port}...`);

const nextBin = path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next');
const child = spawn(process.execPath, [nextBin, 'start', '-p', port, '-H', hostname], {
  cwd: __dirname,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: port,
    HOSTNAME: hostname,
  },
});

child.on('error', (err) => {
  console.error('[FATAL] Failed to start Next.js process:', err);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (code !== 0) {
    console.error(`[CRASH] Next.js process exited with code ${code} (signal: ${signal})`);
  }
  process.exit(code || 0);
});


