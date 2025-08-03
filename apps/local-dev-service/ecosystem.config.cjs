module.exports = {
  apps: [
    {
      name: 'local-dev-service',
      script: './src/server.ts',
      interpreter: 'tsx',
      cwd: __dirname,
      env_file: '.env',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
    },
  ],
};
