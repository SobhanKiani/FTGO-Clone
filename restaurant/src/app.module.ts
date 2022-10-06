import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { FoodController } from './controllers/food/food.controller';
import { RestaurantController } from './controllers/restaurant/restaurant.controller';

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
  ],
  controllers: [RestaurantController, FoodController],
  providers: [],
})
export class AppModule {}
