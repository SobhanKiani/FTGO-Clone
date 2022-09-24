import { Module } from '@nestjs/common';
import { UserController } from './controllers/user/user.controller';
import { PrismaService } from './services/prisma-service/prisma-service.service';
import { UserService } from './services/user/user.service';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [PrismaService, UserService],
})
export class AppModule { }
