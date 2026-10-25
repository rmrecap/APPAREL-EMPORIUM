process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '3000';
process.env.HOSTNAME = process.env.HOSTNAME || '0.0.0.0';

console.log(`[BOOT] Environment: PORT=${process.env.PORT}, HOSTNAME=${process.env.HOSTNAME}, NODE_ENV=${process.env.NODE_ENV}`);

const fs = require('fs');
const path = require('path');

const standaloneDir = path.join(__dirname, '.next', 'standalone');
const standaloneServer = path.join(standaloneDir, 'server.js');

if (fs.existsSync(standaloneServer)) {
  console.log(`[BOOT] Starting Next.js standalone server from ${standaloneServer}...`);
  process.chdir(standaloneDir);
  require(standaloneServer);
} else {
  console.log('[BOOT] Starting Next.js via CLI binary...');
  const { spawn } = require('child_process');
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
}





