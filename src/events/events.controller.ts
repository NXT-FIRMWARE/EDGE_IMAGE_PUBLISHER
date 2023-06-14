import { Controller, Get } from '@nestjs/common';
import { CameraService } from 'src/camera/camera.service';

@Controller('events')
export class EventsController {
  constructor(private  CameraService :CameraService) {}

  @Get()
  Events() {
    this.CameraService.captureProcess();
    return 'event Ok';
  }
}
