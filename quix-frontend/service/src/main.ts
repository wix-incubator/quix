import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {NestExpressApplication} from '@nestjs/platform-express';
import path from 'path';
import velocityEngine from './template-engine/velocity';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(path.resolve(__dirname, '..', 'statics'));
  app.setBaseViewsDir(path.resolve(__dirname, '..', 'statics'));
  app.engine('.vm', velocityEngine());
  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();
