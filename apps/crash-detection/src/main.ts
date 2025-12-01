import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConsoleLogger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      colors: true,
      logLevels: ['log', 'error', 'warn', 'debug', 'verbose'],
      prefix: '[CrashDetection]',
    }),
  });

  app.enableCors({
    origin: ['http://localhost:3000'], // dein Next-Dev
    methods: ['GET'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      host: process.env.MQTT_HOST || 'localhost',
      port: Number(process.env.MQTT_PORT) || 1883,
      username: process.env.MQTT_USER,
      password: process.env.MQTT_PASS,
    },
  });
  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3333);
}
bootstrap();
