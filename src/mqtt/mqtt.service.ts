import { Injectable, Logger } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class MqttService {
  private client: mqtt.MqttClient;
  private client2: mqtt.MqttClient;
  private logger = new Logger(MqttService.name);

  constructor() {
    this.client = mqtt.connect(`mqtt://${process.env.MQTT_BROKER}:1883`, {
      username: 'b162117c-adbe-41a6-aef9-47ce45d02c15',
      password: 'b162117c-adbe-41a6-aef9-47ce45d02c15',
      clientId: 'b162117c-adbe-41a6-aef9-47ce45d02c15',
    });
    //console.log(process.env.SERVER_MQTT);
    this.client.on('connect', this.onConnect.bind(this));
    this.client.on('message', this.onMessage.bind(this));

    this.client2 = mqtt.connect(`mqtt://${process.env.MQTT_BROKER}:1883`, {
      username: '2bbe23e8-e51d-4a62-8da8-23401587d991',
      password: '2bbe23e8-e51d-4a62-8da8-23401587d991',
      clientId: '2bbe23e8-e51d-4a62-8da8-23401587d991',
    });
    //console.log(process.env.SERVER_MQTT);
    this.client2.on('connect', this.onConnect.bind(this));
    this.client2.on('message', this.onMessage.bind(this));
  }

  onConnect() {
    //console.log('connected');
    //to do determine topics and events
    this.client.subscribe('#');
  }

  publishMessage(topic: string, data: string) {
   // this.logger.log('publish', data);
    this.client.publish(topic, data);
  }
  publishMessage2(topic: string, data: string) {
    //this.logger.log('publish', data);
    this.client.publish(topic, data);
  }
  onMessage(topic: string, message: string) {
    // console.log('message arrived');
    // console.log(message.toString());
  }
}
