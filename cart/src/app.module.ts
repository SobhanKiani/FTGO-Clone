import { Module } from '@nestjs/common';
import { PrismaService } from './services/prisma-service/prisma-service.service';
import { UserService } from './services/user/user.service';

@Module({
  imports: [],
  controllers: [],
  providers: [PrismaService, UserService],
})
export class AppModule { }
