import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CameraModule } from './camera/camera.module';
import { PosterModule } from './poster/poster.module';
import { EventsModule } from './events/events.module';
import { SerialModule } from './serial/serial.module';
import { MqttModule } from './mqtt/mqtt.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    CameraModule,
    EventsModule,
    PosterModule,
    SerialModule,
    MqttModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
