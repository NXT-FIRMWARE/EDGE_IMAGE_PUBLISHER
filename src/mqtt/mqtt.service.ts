import { Injectable, Logger } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class MqttService {
  private client: mqtt.MqttClient;
  private logger = new Logger(MqttService.name);

  constructor() {
    this.client = mqtt.connect(`mqtt://${process.env.MQTT_BROKER}:1883`);
    console.log(process.env.SERVER_MQTT);
    this.client.on('connect', this.onConnect.bind(this));
    this.client.on('message', this.onMessage.bind(this));
  }

  onConnect() {
    //console.log('connected');
    //to do determine topics and events
    this.client.subscribe('#');
  }

  publishMessage(data: string, topic: string) {
    this.client.publish(topic, data);
  }
  onMessage(topic: string, message: string) {
    console.log('message arrived');
    console.log(message.toString());
  }
}
