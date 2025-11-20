import cluster from 'node:cluster';
import { cpus } from 'node:os';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { configureApp } from './app.setup';
import configuration from './config/configuration';

async function bootstrap() {
  const appConfig = configuration();
  const clusterEnabled = appConfig.cluster.enabled;
  const workerCount = appConfig.cluster.workers || cpus().length;

  if (clusterEnabled && cluster.isPrimary) {
    console.log(`Primary process ${process.pid} starting ${workerCount} workers`);
    for (let i = 0; i < workerCount; i += 1) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.warn(
        `Worker ${worker.process.pid} exited with code ${code} (${signal ?? 'no signal'}). Restarting...`,
      );
      cluster.fork();
    });
    return;
  }

  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  await configureApp(app);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('port') ?? 3000;
  await app.listen(port);
  console.log(`Application is running on port ${port} (pid: ${process.pid})`);
}

bootstrap();
