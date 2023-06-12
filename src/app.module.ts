import { Module } from '@nestjs/common';
// import { SaverModule } from './saver/saver.module';
import { FtpModule } from './ftp/ftp.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CameraModule } from './camera/camera.module';

@Module({
  imports: [
    // SaverModule,
    FtpModule,
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    CameraModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
