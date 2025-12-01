import { connect } from 'mqtt';

function sanitizeHost(raw: string): string {
  return raw
    .replace(/^mqtts?:\/\//, '')
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
}

let rawHost = 'https://mqtt.mrhost.uk';
const MQTT_HOST = sanitizeHost(rawHost);
const MQTT_PORT = process.env.MQTT_PORT ?? '1883';
const MQTT_USER = 'o3FdplPaEdlZlThL';
const MQTT_PASS = 'KfoY9i3XEx94Ni7yo2TD825U7kiSCvut';

const url = `mqtt://${MQTT_HOST}:${MQTT_PORT}`;
console.log('Connecting to:', url);

const client = connect(url, {
  username: MQTT_USER,
  password: MQTT_PASS,
});

client.on('connect', () => {
  console.log('✅ Connected to MQTT broker!');

  setInterval(() => {
    const payload = {
      carId: 1,
      speed: Math.floor(Math.random() * 50),
      timestamp: Date.now(),
    };

    const topic = 'test/telemetry';
    client.publish(topic, JSON.stringify(payload));
    console.log(`➡️  Published to ${topic}:`, payload);
  }, 1000);
});

client.on('error', (err) => {
  console.error('❌ MQTT Error:', err.message);
});

client.on('close', () => {
  console.log('MQTT connection closed.');
});
