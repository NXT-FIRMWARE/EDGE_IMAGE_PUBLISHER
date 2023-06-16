import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CameraModule } from './camera/camera.module';
import { PosterModule } from './poster/poster.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    CameraModule,
    EventsModule,
    // PosterModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
