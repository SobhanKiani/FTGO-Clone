import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { QUEUE_GROUP_NAME } from './utils/queueGroupName';

async function bootstrap() {
  // const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule,);
  // await app.listen();
  const app = await NestFactory.create(AppModule, { cors: true });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_URL],
      queue: QUEUE_GROUP_NAME,
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 9991,
    },
  });

  app.useGlobalPipes(new ValidationPipe());

  app.startAllMicroservices();
  // await app.listen(9991);
}

bootstrap();
