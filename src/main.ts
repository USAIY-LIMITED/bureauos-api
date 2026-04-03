import * as dns from 'dns';
import { NestFactory } from '@nestjs/core';

dns.setDefaultResultOrder('ipv4first');

import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import basicAuth from 'express-basic-auth';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const appConfigValues = configService.get('app');
  const swaggerConfigValues = configService.get('swagger');

  // Shielding with Helmet (XSS, Clickjacking, etc)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          styleSrc: [`'self'`, `'unsafe-inline'`], // Required for Swagger
          imgSrc: [`'self'`, 'data:', 'https://www.bureauos.space'],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`], // Required for Swagger
        },
      },
    }),
  );

  // Strict CORS for anti-spam/security
  app.enableCors({
    origin: appConfigValues.allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Swagger Gating with Basic Auth
  app.use(
    ['/docs', '/docs-json'],
    basicAuth({
      challenge: true,
      users: { [swaggerConfigValues.user]: swaggerConfigValues.password },
    }),
  );

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('BureauOS API')
    .setDescription(
      'The core infrastructure layer for global business compliance.',
    )
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'X-API-KEY')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = appConfigValues.port;
  await app.listen(port);
  console.log(`🚀 BureauOS API is running on: http://localhost:${port}`);
  console.log(`📄 Swagger documentation: http://localhost:${port}/docs`);
}
bootstrap();
