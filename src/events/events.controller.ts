import { Controller, Get } from '@nestjs/common';
import { CameraService } from 'src/camera/camera.service';

@Controller('events')
export class EventsController {
  constructor(private readonly cameraService: CameraService) {}

  @Get()
  Events() {
    this.cameraService.captureProcess();
    return 'event Ok';
  }
}
