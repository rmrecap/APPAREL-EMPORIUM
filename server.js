const fs = require('fs');
const path = require('path');

const standaloneDir = path.join(__dirname, '.next', 'standalone');
const standaloneServer = path.join(standaloneDir, 'server.js');

if (fs.existsSync(standaloneServer)) {
  console.log('[BOOT] Starting Next.js standalone server from .next/standalone...');
  process.chdir(standaloneDir);
  require(standaloneServer);
} else {
  console.log('[BOOT] Starting Next.js via CLI binary...');
  const { spawn } = require('child_process');
  const nextBin = path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next');
  const child = spawn(process.execPath, [nextBin, 'start', '-p', process.env.PORT || '3000', '-H', '0.0.0.0'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: process.env,
  });

  process.on('SIGTERM', () => { if (child) child.kill('SIGTERM'); process.exit(0); });
  process.on('SIGINT', () => { if (child) child.kill('SIGINT'); process.exit(0); });
  child.on('error', (err) => { console.error('[FATAL] Next.js process failed:', err); process.exit(1); });
  child.on('exit', (code) => { process.exit(code || 0); });
}





