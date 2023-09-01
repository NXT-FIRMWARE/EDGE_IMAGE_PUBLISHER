import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SerialModule } from './serial/serial.module';
import { MqttModule } from './mqtt/mqtt.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    SerialModule,
    MqttModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
