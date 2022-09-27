import { Module } from '@nestjs/common';
import { UserController } from './controllers/user/user.controller';
import { PrismaService } from './services/prisma-service/prisma-service.service';
import { UserService } from './services/user/user.service';
import { CartService } from './services/cart/cart.service';
import { CartController } from './controllers/cart/cart.controller';
import { CartFoodController } from './controllers/cart-food/cart-food.controller';
import { FoodController } from './controllers/food/food.controller';
import { FoodService } from './services/food/food.service';
import { CartFoodService } from './services/cart-food/cart-food.service';

@Module({
  imports: [],
  controllers: [UserController, CartController, FoodController, CartFoodController],
  providers: [PrismaService, UserService, CartService, FoodService, CartFoodService],
})
export class AppModule { }
