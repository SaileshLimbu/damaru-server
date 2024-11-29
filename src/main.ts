import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ExceptionHandler } from './core/middlewares/ExceptionHandler';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const logger = new Logger('App-Error');

  // Swagger setup
  const options = new DocumentBuilder()
    .setTitle('Damaru API')
    .setDescription(
      'Damaru is a system designed for screen sharing and emulator management',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .setExternalDoc('Postman Collection', '/apis-json')
    .build();
  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('apis', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  app.enableCors({
    // origin: whiteListedDomain ? whiteListedDomain.split(',') : ['*'],
    origin: ['*'],
    methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE'],
    optionsSuccessStatus: 200,
    credentials: true,
  });
  app.useLogger(logger);
  // Error Handler
  app.useGlobalFilters(new ExceptionHandler(logger));
  await app.listen(3001);
}

bootstrap().then(() => {
  console.log('Application bootstrap completed!');
});
