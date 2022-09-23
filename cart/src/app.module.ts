import { Module } from '@nestjs/common';
import { PrismaService } from './services/prisma-service/prisma-service.service';
import { UserService } from './services/user/user.service';
import { UserController } from './user/user.controller';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [PrismaService, UserService],
})
export class AppModule { }
