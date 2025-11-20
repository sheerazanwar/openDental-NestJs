import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { configureApp } from './app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  await configureApp(app);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('port') ?? 3000;
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}

bootstrap();
