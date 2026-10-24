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
      restart_delay: 4000,
      max_restarts: 10,
      watch: false,
      max_memory_restart: '1200M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '127.0.0.1',
      },
    },
  ],
};



