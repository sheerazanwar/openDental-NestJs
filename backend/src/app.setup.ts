import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import session from 'express-session';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export async function configureApp(app: INestApplication) {
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.setGlobalPrefix('api');
  app.enableCors();

  app.use(
    session({
      secret: configService.get<string>('session.secret') ?? 'session-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: (configService.get<number>('session.ttlHours') ?? 24) * 60 * 60 * 1000,
      },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('CogniFlow OpenDental Platform')
    .setDescription(
      'Comprehensive API that orchestrates clinic onboarding, patient eligibility, claim submission, and payment reconciliation with OpenDental.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      docExpansion: 'list',
      persistAuthorization: true,
    },
  });
}
