import { forwardRef, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodModule } from '../../src/food/food.module';
import { RestaurantController } from '../../src/restaurant/controllers/restaurant.controller';
import { Restaurant } from '../../src/restaurant/models/restaurant.model';
import { RestaurantService } from '../../src/restaurant/services/restaurant.service';

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
