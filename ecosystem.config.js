module.exports = {
  apps: [
    {
      name: 'aelbd-production',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '15s',
      exp_backoff_restart_delay: 2000,
      watch: false,
      max_memory_restart: '700M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        UV_THREADPOOL_SIZE: '1',
      },
    },
  ],
};

