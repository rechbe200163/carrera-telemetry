// car-telemetry.test.ts
import mqtt from 'mqtt';

const CAR_ID = 0;
const BROKER_URL = process.env.MQTT_URL ?? 'mqtt://localhost:1883';
const TOPIC = `car/${CAR_ID}/telemetry`;

interface CarTelemetry {
  carId: number;
  accelX: number;
  accelY: number;
  accelZ: number;
  gyroX: number;
  gyroY: number;
  gyroZ: number;
  ts: number;
}

console.log(`Connecting to MQTT broker at ${BROKER_URL} ...`);

const client = mqtt.connect(BROKER_URL);

client.on('connect', () => {
  console.log('✅ Connected to MQTT broker');
  console.log(`Publishing test telemetry to topic "${TOPIC}" ...`);

  setInterval(() => {
    const telemetry: CarTelemetry = {
      carId: CAR_ID,
      // bisschen „realistischere“ Zufallswerte
      accelX: (Math.random() - 0.5) * 10, // -5..5 m/s^2
      accelY: (Math.random() - 0.5) * 10,
      accelZ: 9.81 + (Math.random() - 0.5) * 1, // um die Erdanziehung herum

      gyroX: (Math.random() - 0.5) * 200, // °/s
      gyroY: (Math.random() - 0.5) * 200,
      gyroZ: (Math.random() - 0.5) * 200,

      ts: Date.now(),
    };

    const payload = JSON.stringify(telemetry);

    client.publish(TOPIC, payload, { qos: 0 }, (err) => {
      if (err) {
        console.error('❌ Publish error:', err.message);
      } else {
        console.log('📤 Sent:', payload);
      }
    });
  }, 500); // alle 500ms
});

client.on('error', (err) => {
  console.error('MQTT error:', err.message);
});

client.on('close', () => {
  console.log('MQTT connection closed');
});
