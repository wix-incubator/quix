import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {NestExpressApplication} from '@nestjs/platform-express';
import path from 'path';
import velocityEngine from './template-engine/velocity';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(path.resolve(__dirname, '..', 'statics'));
  app.setBaseViewsDir(path.resolve(__dirname, '..', 'statics'));
  app.engine('.vm', velocityEngine());

  await app.listen(3000);
}
bootstrap();
