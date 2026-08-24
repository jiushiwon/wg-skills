// pm2 ecosystem 模板（Node.js）。端口从 APP_PORT 读取。
// 用法：pm2 start ecosystem.config.js --env production
module.exports = {
  apps: [{
    name: process.env.APP_NAME || 'my-api',
    script: 'dist/server.js',
    instances: process.env.PM2_INSTANCES || 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      APP_PORT: 8080
    },
    env_production: {
      NODE_ENV: 'production',
      APP_PORT: process.env.APP_PORT || 8080
    },
    error_file: `${process.env.LOG_DIR || '/var/log/my-api'}/err.log`,
    out_file: `${process.env.LOG_DIR || '/var/log/my-api'}/out.log`,
    merge_logs: true,
    time: true,
    max_memory_restart: '500M',
    restart_delay: 5000
  }]
};
