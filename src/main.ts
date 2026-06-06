import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(json({ limit: '100mb' }));

  app.use('/callback/omise', express.raw({ type: 'application/json' }));
  await app.listen(3000);
}
bootstrap();
