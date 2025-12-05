import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as mqtt from 'mqtt';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private client: mqtt.MqttClient;

  onModuleInit() {
    this.client = mqtt.connect({
      host: process.env.MQTT_HOST,
      port: Number(process.env.MQTT_PORT ?? 1883),
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
      protocol: 'mqtt',
    });

    this.client.on('connect', () => {
      console.log('[MQTT] connected');
    });

    this.client.on('error', (err) => {
      console.error('[MQTT] error', err);
    });
  }

  onModuleDestroy() {
    this.client?.end();
  }

  publish(topic: string, payload: any) {
    const msg = typeof payload === 'string' ? payload : JSON.stringify(payload);
    this.client.publish(topic, msg, { qos: 1 });
  }

  subscribe(topic: string, handler: (payload: any) => void) {
    this.client.subscribe(topic, { qos: 1 });
    this.client.on('message', (t, msg) => {
      if (t !== topic) return;
      try {
        const parsed = JSON.parse(msg.toString());
        handler(parsed);
      } catch (e) {
        console.warn('[MQTT] invalid JSON', e);
      }
    });
  }
}
