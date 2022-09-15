import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantModule } from '../../test/mocks/restaurant.module';
import { FoodController } from './controllers/food.controller';
import { Food } from './models/food.model';
import { FoodService } from './services/food.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Food]),
        forwardRef(() => RestaurantModule)
    ],
    controllers: [FoodController],
    providers: [FoodService],
    exports: [TypeOrmModule, FoodService]
})
export class FoodModule { }
