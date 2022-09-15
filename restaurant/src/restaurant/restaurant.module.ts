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
    forwardRef(() => FoodModule),
    ClientsModule.register([
      {
        name: "AUTHENTICATION_SERVICE",
        transport: Transport.NATS,
        options: {
          servers: ['nats://nats-server:4222']
        }
      }
    ]),
  ],
  controllers: [RestaurantController],
  providers: [RestaurantService],
  exports: [TypeOrmModule, RestaurantService,]
})
export class RestaurantModule { }
