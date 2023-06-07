import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ScheduleModule } from '@nestjs/schedule';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
