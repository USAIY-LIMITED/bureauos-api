import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import basicAuth from 'express-basic-auth';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Global Validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Swagger Gating with Basic Auth
  const swaggerUser = process.env.SWAGGER_USER || 'admin';
  const swaggerPass = process.env.SWAGGER_PASSWORD || 'bureau_admin_pass';

  app.use(
    ['/docs', '/docs-json'],
    basicAuth({
      challenge: true,
      users: { [swaggerUser]: swaggerPass },
    }),
  );

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('BureauOS API')
    .setDescription('The core infrastructure layer for global business compliance.')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'X-API-KEY')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 BureauOS API is running on: http://localhost:${port}`);
  console.log(`📄 Swagger documentation: http://localhost:${port}/docs`);
}
bootstrap();
