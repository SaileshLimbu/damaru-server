import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { ExceptionHandler } from './core/middlewares/ExceptionHandler';
import { ConfigService } from '@nestjs/config';
import 'reflect-metadata';
import { EncryptionInterceptor } from './core/middlewares/EncryptionInterceptor';
import { EncryptionService } from './core/encryption/encryption.service';
import * as bodyParser from 'body-parser';
import { Environments } from './common/interfaces/environments';
import { CoreDataSeederService } from './core/database/coredataseeder.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.useGlobalPipes(new ValidationPipe());
  const logger = new Logger('App-Error');
  const configService = app.get(ConfigService);

  let title = `Damaru APIs`;
  if (process.env.ENVIRONMENT === Environments.PRODUCTION) {
    title += '[LIVE]';
  } else {
    title += '[DEVELOPMENT]';
  }
  // Swagger setup
  const options = new DocumentBuilder()
    .setTitle(title)
    .setDescription('Damaru is a system designed for screen sharing and emulator management')
    .setVersion('1.0')
    .addBearerAuth()
    .setExternalDoc('Postman Collection', '/apis-json')
    .build();
  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('apis', app, document, {
    swaggerOptions: {
      persistAuthorization: true
    }
  });
  app.enableCors({
    // origin: whiteListedDomain ? whiteListedDomain.split(',') : ['*'],
    origin: ['*'],
    methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE'],
    optionsSuccessStatus: 200
    // credentials: true
  });

  app.use(bodyParser.text());

  app.useLogger(logger);
  // Error Handler
  app.useGlobalFilters(new ExceptionHandler(logger, configService));

  const environment = app.get(ConfigService).get<string>('ENVIRONMENT') || Environments.DEVELOPMENT;
  console.log(`Environment: ${environment}`);
  const dataSeederService = app.get(CoreDataSeederService);
  await dataSeederService.seedRoles();
  await dataSeederService.seedEncryption();
  // Resolve EncryptionService manually
  const encryptionService = app.get(EncryptionService);
  const reflector = app.get(Reflector);
  if (environment !== Environments.DEVELOPMENT.toString()) {
    app.useGlobalInterceptors(new EncryptionInterceptor(encryptionService, reflector));
  }
  await app.listen(configService.get<number>('APP_PORT') || 3000);
}

void bootstrap();
