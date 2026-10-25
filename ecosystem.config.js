const path = require('path');

module.exports = {
  apps: [
    {
      name: 'aelbd-production',
      cwd: __dirname,
      script: 'server.js',
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






