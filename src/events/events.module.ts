import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { CameraService } from 'src/camera/camera.service';

@Module({
  controllers: [EventsController],
  providers: [EventsService],
  imports: [CameraService],
})
export class EventsModule {}
