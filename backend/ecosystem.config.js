const workerCount = parseInt(process.env.CLUSTER_WORKERS ?? '0', 10);
const instances = Number.isNaN(workerCount) || workerCount <= 0 ? 'max' : workerCount;

module.exports = {
  apps: [
    {
      name: 'opendental-backend',
      script: 'dist/main.js',
      instances,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        ...(Number.isNaN(workerCount) || workerCount <= 0
          ? {}
          : { CLUSTER_WORKERS: workerCount.toString() }),
      },
    },
  ],
};
