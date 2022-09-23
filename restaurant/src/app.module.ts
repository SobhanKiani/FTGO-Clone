import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RestaurantController } from './restaurant/controllers/restaurant.controller';
import { RestaurantModule } from './restaurant/restaurant.module';
import { FoodModule } from './food/food.module';
import { FoodController } from './food/controllers/food.controller';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [join(__dirname, '**', '*.model.{ts,js}')],
      autoLoadEntities: true,
      synchronize: true,
    }),
    RestaurantModule,
    FoodModule,
  ],
  controllers: [RestaurantController, FoodController],
  providers: [],
})
export class AppModule {
  constructor(dataSource: DataSource) { }
}
