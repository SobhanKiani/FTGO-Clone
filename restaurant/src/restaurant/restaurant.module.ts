import { forwardRef, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodModule } from '../food/food.module';
import { RestaurantController } from './controllers/restaurant.controller';
import { Restaurant } from './models/restaurant.model';
import { RestaurantService } from './services/restaurant.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Restaurant]),
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.NATS,
        options: {
          // servers: ['nats://nats-server:4222']
          servers: [process.env.NATS_URL]
        }

      },
    ]),
    forwardRef(() => FoodModule)
  ],
  controllers: [RestaurantController],
  providers: [RestaurantService,],
  exports: [TypeOrmModule, RestaurantService,]
})
export class RestaurantModule { }
