import { Module } from '@nestjs/common';
import { SerialService } from './serial.service';
import { SerialService } from './serial.service';

@Module({
  providers: [SerialService]
})
export class SerialModule {}
