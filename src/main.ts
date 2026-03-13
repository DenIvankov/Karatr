import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Karate API')
    .setDescription('API documentation for the Karate project')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      operationsSorter: 'method',
    },
  });

  const basePort = Number(process.env.PORT ?? 3000);
  let port = basePort;

  while (true) {
    try {
      await app.listen(port);
      break;
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'EADDRINUSE'
      ) {
        port += 1;
        continue;
      }

      throw error;
    }
  }

  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
