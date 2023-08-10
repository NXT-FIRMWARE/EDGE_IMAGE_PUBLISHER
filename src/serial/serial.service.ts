import { Injectable } from '@nestjs/common';
import { SerialPort } from 'serialport';
import { DelimiterParser } from '@serialport/parser-delimiter';

@Injectable()
export class SerialService {
  private lora_device;
  private lora_parser;
  constructor() {
    try {
      this.lora_device = new SerialPort({
        path: '/dev/ttyS1',
        baudRate: 115200,
      });
      this.lora_parser = this.lora_device.pipe(
        new DelimiterParser({ delimiter: '\n' }),
      );
      this.lora_parser.on('data', this.onLoraData.bind(this));
    } catch (error) {
      console.log(error);
    }
  }
  async onLoraData(data: any) {
    console.log('data: ', data.toString());
  }
}
