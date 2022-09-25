import { Injectable } from '@nestjs/common';
import { Cart, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma-service/prisma-service.service';

@Injectable()
export class CartService {
    constructor(
        private prisma: PrismaService,
    ) { }

    async getCartOrCreate(data: Prisma.CartCreateInput): Promise<Cart> {
        const userId = data.user.connect.id;
        return await this.prisma.cart.upsert({
            where: { userId: userId },
            create: data,
            update: {}
        });
    }

    async deleteCart(args: Prisma.CartDeleteArgs): Promise<Cart> {
        const { where } = args
        return await this.prisma.cart.delete({ where });
    }

}
