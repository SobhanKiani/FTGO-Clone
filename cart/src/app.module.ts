import { Module } from '@nestjs/common';
import { PrismaService } from './services/prisma-service/prisma-service.service';

@Module({
  imports: [],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule { }
