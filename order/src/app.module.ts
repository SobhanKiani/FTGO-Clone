import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrderController } from './controllers/order/order.controller';
import { OrderService } from './services/order/order.service';
import { PrismaService } from './services/prisma-service/prisma-service.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NATS_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: [process.env.NATS_URL]
        }
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService, PrismaService],
})
export class AppModule { }
