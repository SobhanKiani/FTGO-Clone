import { forwardRef, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantModule } from '../restaurant/restaurant.module';
import { FoodController } from './controllers/food.controller';
import { Food } from './models/food.model';
import { FoodService } from './services/food.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Food]),
    forwardRef(() => RestaurantModule),
    ClientsModule.register([
      {
        name: 'NATS_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: [process.env.NATS_URL],
        },
      },
    ]),
  ],
  controllers: [FoodController],
  providers: [FoodService],
  exports: [TypeOrmModule, FoodService],
})
export class FoodModule {}
