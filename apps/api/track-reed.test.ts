// track-reed-event.test.ts
import mqtt from 'mqtt';

export enum Sectors {
  START_FINISH = 0,
  SECTOR_1 = 1,
  SECTOR_2 = 2,
}

const BROKER_URL = process.env.MQTT_URL ?? 'mqtt://localhost:1883';

interface TrackReedEvent {
  deviceId: string;
  sectorId: number;
  value: boolean;
  ts: number;
}

console.log(`Connecting to MQTT broker at ${BROKER_URL} ...`);

const client = mqtt.connect(BROKER_URL);

// Reihenfolge der Strecke: SF -> S1 -> S2 -> SF -> ...
const sectorsOrder: Sectors[] = [
  Sectors.START_FINISH,
  Sectors.SECTOR_1,
  Sectors.SECTOR_2,
];

let currentSectorIndex = -1; // -1, damit der erste Call bei 0 (START_FINISH) landet

function getNextSector(): Sectors {
  currentSectorIndex = (currentSectorIndex + 1) % sectorsOrder.length;
  return sectorsOrder[currentSectorIndex];
}

// Zufallszeit zwischen 15s und 20s (in ms)
function randomDelayMs(): number {
  const min = 15_000;
  const max = 20_000;
  return min + Math.random() * (max - min);
}

function scheduleNextEvent() {
  const delay = randomDelayMs();

  setTimeout(() => {
    const sectorId = getNextSector();
    const topic = `sector/${sectorId}/reed-event`;

    const event: TrackReedEvent = {
      deviceId: 'track-controller-1',
      sectorId,
      value: true, // Rising-edge Event (Magnet erkannt)
      ts: Date.now(),
    };

    const payload = JSON.stringify(event);

    client.publish(topic, payload, { qos: 0 }, (err) => {
      if (err) {
        console.error('❌ Publish error:', err.message);
      } else {
        console.log(
          `📤 Reed Event Published to "${topic}" after ${Math.round(
            delay / 1000,
          )}s:`,
          payload,
        );
      }
    });

    // Nächsten Event planen
    scheduleNextEvent();
  }, delay);
}

client.on('connect', () => {
  console.log('✅ Connected to MQTT broker');
  console.log('Starting sector sequence simulation (SF -> S1 -> S2 -> SF ...)');

  // ersten Event starten
  scheduleNextEvent();
});

client.on('error', (err) => {
  console.error('MQTT error:', err.message);
});

client.on('close', () => {
  console.log('MQTT connection closed');
});
