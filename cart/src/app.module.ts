import { Module } from '@nestjs/common';
import { UserController } from './controllers/user/user.controller';
import { PrismaService } from './services/prisma-service/prisma-service.service';
import { UserService } from './services/user/user.service';
import { CartService } from './services/cart/cart.service';
import { CartController } from './controllers/cart/cart.controller';
import { FoodService } from './controllers/food/food.service';
import { FoodController } from './food/food.controller';

@Module({
  imports: [],
  controllers: [UserController, CartController, FoodController],
  providers: [PrismaService, UserService, CartService, FoodService],
})
export class AppModule { }
