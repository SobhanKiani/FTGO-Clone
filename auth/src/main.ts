import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { QUEUE_GROUP_NAME } from './utils/queueGroupName';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  console.log(process.env.NATS_URL);

  app.connectMicroservice({
    transport: Transport.NATS,
    options: {
      servers: ['nats://nats-server:4222'],
      // url: process.env.NATS_URL,
      queue: QUEUE_GROUP_NAME,
    },
  });

  app.useGlobalPipes(new ValidationPipe());

  app.startAllMicroservices();

  await app.listen(9991);
}

bootstrap();
