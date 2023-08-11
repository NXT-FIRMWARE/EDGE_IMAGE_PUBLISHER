import { Module } from '@nestjs/common';
import { SerialService } from './serial.service';
import { MqttModule } from 'src/mqtt/mqtt.module';

@Module({
  providers: [SerialService],
  imports: [MqttModule],
})
export class SerialModule {}
