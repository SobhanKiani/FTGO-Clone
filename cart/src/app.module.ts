import { Module } from '@nestjs/common';
import { UserController } from './controllers/user/user.controller';
import { PrismaService } from './services/prisma-service/prisma-service.service';
import { UserService } from './services/user/user.service';
import { CartService } from './services/cart/cart.service';
import { CartController } from './controllers/cart/cart.controller';

@Module({
  imports: [],
  controllers: [UserController, CartController],
  providers: [PrismaService, UserService, CartService],
})
export class AppModule { }
