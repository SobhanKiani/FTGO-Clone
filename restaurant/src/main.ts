import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { QUEUE_GROUP_NAME } from './utils/queueGroupName';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      // servers: ['nats://nats-server:4222'],
      servers: [process.env.NATS_URL],
      queue: QUEUE_GROUP_NAME,
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 9993,
    },
  });

  app.useGlobalPipes(new ValidationPipe());

  app.startAllMicroservices();
  // await app.listen(9993)

}
bootstrap();
