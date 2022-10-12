import { Injectable } from '@nestjs/common';
import { Order, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma-service/prisma-service.service';

@Injectable()
export class OrderService {
    constructor(
        private readonly prisma: PrismaService
    ) { }

    async createOrder(data: Prisma.OrderCreateInput): Promise<Order> {
        return await this.prisma.order.create({ data });
    }
}
