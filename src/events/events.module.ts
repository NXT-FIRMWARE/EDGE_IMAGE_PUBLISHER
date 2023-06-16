import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { CameraModule } from 'src/camera/camera.module';

@Module({
  controllers: [EventsController],
  imports: [CameraModule],
})
export class EventsModule {}
