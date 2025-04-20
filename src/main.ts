import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import helmet from 'helmet';

async function bootstrap() {
    // Create a logger for the bootstrap process
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  logger.log('Application created');

  app.use(bodyParser.json({ limit: '20mb' }));
  app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

  // Enable security headers.
  app.use(helmet());

   // Ensure that all incoming requests are validated against the DTOs.
   app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      enableDebugMessages: true,
      whitelist: true, // Strip out any properties that are not defined in the DTO.
    }),
  );

    app.setGlobalPrefix('api');
    //  Enable global versioning
    app.enableVersioning({ 
        type: VersioningType.URI,
        defaultVersion: '1',
      });
  
  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('Category Management API')
    .setDescription('API for managing hierarchical categories')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}
void bootstrap();
