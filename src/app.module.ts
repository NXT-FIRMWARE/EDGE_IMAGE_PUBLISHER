import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CameraModule } from './camera/camera.module';
import { PosterModule } from './poster/poster.module';
import { EventsModule } from './events/events.module';
import { ServerModule } from './server/server.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    CameraModule,
    // PosterModule,
    EventsModule,
    ServerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
