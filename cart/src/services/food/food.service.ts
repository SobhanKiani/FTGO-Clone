import { Injectable } from '@nestjs/common';
import { Food, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma-service/prisma-service.service';

@Injectable()
export class FoodService {
  constructor(private prisma: PrismaService) {}

  async createFood(data: Prisma.FoodCreateInput): Promise<Food> {
    return await this.prisma.food.create({ data });
  }

  async updateFood(
    where: Prisma.FoodWhereUniqueInput,
    data: Prisma.FoodUpdateInput,
  ): Promise<Food> {
    return await this.prisma.food.update({
      where,
      data,
    });
  }

  async deleteFood(args: Prisma.FoodDeleteArgs): Promise<Food> {
    return await this.prisma.food.delete({ where: args.where });
  }
}
