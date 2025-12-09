import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private client: mqtt.MqttClient;

  // Topic -> Handler-Liste
  private handlers = new Map<string, ((payload: any) => void)[]>();

  // Lap-Events Stream (für SSE)
  private readonly lapEventsSubject = new Subject<any>();

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

    this.client.on('message', (topic, msg) => {
      let parsed: any;
      try {
        parsed = JSON.parse(msg.toString());
      } catch (e) {
        console.warn('[MQTT] invalid JSON', e);
        return;
      }

      // 🔴 Spezialfall: Lap-Events → in Observable streamen
      if (topic === 'carrera/cu/lapTimes') {
        this.lapEventsSubject.next(parsed);
      }

      // 🔁 alle registrierten Handler für das Topic ausführen
      const topicHandlers = this.handlers.get(topic);
      if (topicHandlers?.length) {
        for (const handler of topicHandlers) {
          handler(parsed);
        }
      }
    });
  }

  onModuleDestroy() {
    this.client?.end();
  }

  publish(topic: string, payload: any) {
    const msg = typeof payload === 'string' ? payload : JSON.stringify(payload);
    this.client.publish(topic, msg, { qos: 1 });
  }

  // klassische Callback-Subscription (für Consumer wie LapEventsConsumer)
  subscribe(topic: string, handler: (payload: any) => void) {
    this.client.subscribe(topic, { qos: 1 });
    const list = this.handlers.get(topic) ?? [];
    list.push(handler);
    this.handlers.set(topic, list);
  }

  // 🔥 Neu: Lap-Events als Observable (für SSE)
  lapEvents$(): Observable<any> {
    return this.lapEventsSubject.asObservable();
  }
}
