import { Injectable } from '@nestjs/common';
import { SerialPort } from 'serialport';
import { DelimiterParser } from '@serialport/parser-delimiter';
import { MqttClient } from 'mqtt/*';
@Injectable()
export class SerialService {
  private lora_device;
  private lora_parser;
  constructor(private readonly mqttClient:MqttClient) {
    try {
      this.lora_device = new SerialPort({
        path: '/dev/ttyS1',
        baudRate: 115200,
      });
      this.lora_parser = this.lora_device.pipe(
        new DelimiterParser({ delimiter: '\r\n', includeDelimiter: true }),
      );
      this.lora_parser.on('data', this.onLoraData.bind(this));
    } catch (error) {
      console.log(error);
    }
  }
  async onLoraData(buffer: Buffer) {
    console.log('data: ', buffer.toString());
    try {
      if (buffer != null && buffer.length > 2) {
        const byteBegin = buffer[0].toString(16).padStart(2, '0').toUpperCase();
        const begin: number = parseInt(byteBegin, 16);
        const devAddr: string = buffer
          .subarray(7, 11)
          .toString('hex')
          .toUpperCase();
        const devEUI: string = buffer
          .subarray(13, 21)
          .toString('hex')
          .toUpperCase();
        const appEUI: string = buffer
          .subarray(23, 31)
          .toString('hex')
          .toUpperCase();
        const date = Date.now();
        const type = begin;
        const payload = buffer;
        console.log(`${date} - ${devAddr} - ${payload.toString('hex')}`);
        //decode Message
        const decoded = [];
        const Offset = 37;

        decoded.push({ variable: 'DevAddr', value: devAddr });
        decoded.push({ variable: 'DevEUI', value: devEUI });
        decoded.push({ variable: 'AppEUI', value: appEUI });
        decoded.push({
          variable: 'temperature',
          value: (payload[Offset + 0] | (payload[Offset + 1] << 8)) / 100,
          unit: '°C',
        });
        decoded.push({
          variable: 'humidity',
          value: (payload[Offset + 2] | (payload[Offset + 3] << 8)) / 100,
          unit: '%',
        });
        decoded.push({
          variable: 'pressure',
          value:
            (payload[Offset + 7] << 24) |
            (payload[Offset + 6] << 16) |
            (payload[Offset + 5] << 8) |
            payload[Offset + 4],
          unit: 'Pa',
        });
        decoded.push({
          variable: 'battery',
          value: (payload[Offset + 8] | (payload[Offset + 9] << 8)) / 100,
          unit: 'V',
        });
        decoded.push({
          variable: 'solar',
          value: (payload[Offset + 10] | (payload[Offset + 11] << 8)) / 100,
          unit: 'V',
        });

        this.mqttClient.publish('', decoded.toString());
      }
    } catch (error: any) {
      console.log(`Error reading data: ${error.message}`);
    }
  }
}
