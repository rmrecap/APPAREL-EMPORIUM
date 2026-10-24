const { spawn } = require('child_process');
const path = require('path');

process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '3000';
process.env.HOSTNAME = process.env.HOSTNAME || '127.0.0.1';

console.log(`[BOOT] Launching Next.js production server on http://${process.env.HOSTNAME}:${process.env.PORT}...`);

const nextBin = path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next');
const child = spawn(process.execPath, [nextBin, 'start', '-p', process.env.PORT, '-H', process.env.HOSTNAME], {
  cwd: __dirname,
  stdio: 'inherit',
  env: process.env,
});

process.on('SIGTERM', () => { if (child) child.kill('SIGTERM'); process.exit(0); });
process.on('SIGINT', () => { if (child) child.kill('SIGINT'); process.exit(0); });
child.on('error', (err) => { console.error('[FATAL] Next.js process failed:', err); process.exit(1); });
child.on('exit', (code) => { process.exit(code || 0); });




