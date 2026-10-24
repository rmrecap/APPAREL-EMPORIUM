const fs = require('fs');
const path = require('path');

const standaloneDir = path.join(__dirname, '.next', 'standalone');
const standaloneServer = path.join(standaloneDir, 'server.js');
const useStandalone = fs.existsSync(standaloneServer);

module.exports = {
  apps: [
    {
      name: 'aelbd-production',
      cwd: useStandalone ? standaloneDir : __dirname,
      script: useStandalone ? 'server.js' : './node_modules/next/dist/bin/next',
      args: useStandalone ? '' : ['start', '-p', '3000', '-H', '0.0.0.0'],
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      restart_delay: 3000,
      max_restarts: 10,
      watch: false,
      max_memory_restart: '1200M',
      out_file: path.join(__dirname, 'pm2-out.log'),
      error_file: path.join(__dirname, 'pm2-error.log'),
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
    },
  ],
};






