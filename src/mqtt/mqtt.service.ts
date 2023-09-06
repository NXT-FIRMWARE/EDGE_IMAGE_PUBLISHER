import { Injectable, Logger } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { Cron } from '@nestjs/schedule';
import { networkInterfaces } from 'os';
@Injectable()
export class MqttService {
  private client: mqtt.MqttClient;
  private client2: mqtt.MqttClient;
  private client3: mqtt.MqttClient;
  private logger = new Logger(MqttService.name);

  constructor() {
    this.client2 = mqtt.connect(`mqtt://mqtt.tago.io:1883`, {
      reconnectPeriod: 1000 * 1,
      username: '7f45de9d-bc78-4dd0-8215-a84af018251a',
      password: '7f45de9d-bc78-4dd0-8215-a84af018251a',
      clientId: '7f45de9d-bc78-4dd0-8215-a84af018251a',
    });
    this.client3 = mqtt.connect(`mqtt://mqtt.tago.io:1883`, {
      reconnectPeriod: 1000 * 1,
      username: '2bbe23e8-e51d-4a62-8da8-23401587d991',
      password: '2bbe23e8-e51d-4a62-8da8-23401587d991',
      clientId: '2bbe23e8-e51d-4a62-8da8-23401587d991',
    });
    this.client = mqtt.connect(`mqtt://mqtt.digisense.es:1883`, {
      reconnectPeriod: 1000 * 1,
      // connectTimeout: 30 * 1000,
      // keepalive: 300,
      // username: '7f45de9d-bc78-4dd0-8215-a84af018251a',
      // password: '7f45de9d-bc78-4dd0-8215-a84af018251a',
      clientId: 'edgelora001',
    });
    //console.log(process.env.SERVER_MQTT);
    this.client.on('connect', this.onConnect.bind(this));
    // this.client.on('message', this.onMessage.bind(this));

    // this.client2 = mqtt.connect(`mqtt://${process.env.MQTT_BROKER}:1883`, {
    //   reconnectPeriod: 1000 * 1,
    //   username: '2bbe23e8-e51d-4a62-8da8-23401587d991',
    //   password: '2bbe23e8-e51d-4a62-8da8-23401587d991',
    //   clientId: '2bbe23e8-e51d-4a62-8da8-23401587d991',
    // });
    //console.log(process.env.SERVER_MQTT);
    // this.client2.on('connect', this.onConnect.bind(this));
    // this.client2.on('message', this.onMessage.bind(this));

    setInterval(async () => {
      try {
        const nets = await networkInterfaces();
        this.client.publish(
          'nxt/device/ip',
          nets['ppp0'][0].address.toString(),
        );
      } catch (error) {
        console.log(error);
      }
    }, 10 * 1000);
  }

  onConnect() {
    console.log('connected');
    //to do determine topics and events
    //this.client.subscribe('#');
  }

  async publishMessage(topic: string, data: string) {
    // this.logger.log('publish', data);
    this.client.publish(topic, data);
    this.client3.publish(topic, data);
  }
  publishMessage2(topic: string, data: string) {
    //this.logger.log('publish', data);
    this.client.publish(topic, data);
    this.client2.publish(topic, data);
  }
  // onMessage(topic: string, message: string) {
  //   // console.log('message arrived');
  //   // console.log(message.toString());
  // }
}
