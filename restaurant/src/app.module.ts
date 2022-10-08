import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { FoodController } from './controllers/food/food.controller';
import { RestaurantController } from './controllers/restaurant/restaurant.controller';
import { Food } from './models/food.model';
import { Restaurant } from './models/restaurant.model';
import { FoodService } from './services/food/food.service';
import { RestaurantService } from './services/restaurant/restaurant.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [join(__dirname, '**', '*.model.{ts,js}')],
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Restaurant, Food]),

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
  controllers: [RestaurantController, FoodController],
  providers: [RestaurantService, FoodService],
  exports: [TypeOrmModule],
})
export class AppModule {}
