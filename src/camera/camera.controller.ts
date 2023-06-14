import { Controller } from '@nestjs/common';

@Controller('camera')
export class CameraController {
  constructor(private readonly cameraController: CameraController) {}
}
