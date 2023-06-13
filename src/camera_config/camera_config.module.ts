import { Module } from '@nestjs/common';
import { CameraConfigService } from './camera_config.service';
import { CameraConfigController } from './camera_config.controller';
import { CameraModule } from 'src/camera/camera.module';
@Module({
  controllers: [CameraConfigController],
  providers: [CameraConfigService],
  imports : [ CameraModule ]
  
})
export class CameraConfigModule {}
