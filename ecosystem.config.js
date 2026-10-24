const path = require('path');

module.exports = {
  apps: [
    {
      name: 'aelbd-production',
      cwd: __dirname,
      script: './node_modules/next/dist/bin/next',
      args: ['start', '-p', '3000', '-H', '127.0.0.1'],
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      restart_delay: 4000,
      max_restarts: 10,
      watch: false,
      max_memory_restart: '1200M',
      out_file: path.join(__dirname, 'pm2-out.log'),
      error_file: path.join(__dirname, 'pm2-error.log'),
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '127.0.0.1',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '127.0.0.1',
      },
    },
  ],
};





