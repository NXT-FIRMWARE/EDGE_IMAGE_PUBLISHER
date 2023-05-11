import { Module } from '@nestjs/common';
import { FtpService } from './ftp.service';

@Module({
  providers: [FtpService]
})
export class FtpModule {}
