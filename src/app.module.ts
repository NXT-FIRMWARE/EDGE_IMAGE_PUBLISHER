import { Module } from '@nestjs/common';
// import { SaverModule } from './saver/saver.module';
import { FtpModule } from './ftp/ftp.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CameraModule } from './camera/camera.module';
import { CameraConfigModule } from './camera_config/camera_config.module';

@Module({
  imports: [
    // SaverModule,
    FtpModule,
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    CameraModule,
    CameraConfigModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
