const fs = require('fs');
const path = require('path');

// Auto-detect standalone server.js to save 150-200MB RAM, fallback to next binary if not yet built
const standaloneServer = path.join(__dirname, '.next', 'standalone', 'server.js');
const useStandalone = fs.existsSync(standaloneServer);

module.exports = {
  apps: [
    {
      name: 'aelbd-production',
      cwd: __dirname,
      script: 'server.js',
      args: '',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '15s',
      exp_backoff_restart_delay: 2000,
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
        UV_THREADPOOL_SIZE: '1',
      },
    },
  ],
};


