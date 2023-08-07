import { Module } from '@nestjs/common';
import { PosterService } from './poster.service';
import { CameraModule } from 'src/camera/camera.module';

@Module({
  imports: [CameraModule],
  providers: [PosterService],
})
export class PosterModule {}
