import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma-service/prisma-service.service';

@Injectable()
export class FoodService {
    constructor(
        private prisma: PrismaService,
    ) { }

    async createFood(data: Prisma.FoodCreateInput) {
        return await this.prisma.food.create({ data });
    }
}
