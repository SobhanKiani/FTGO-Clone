import { Injectable } from '@nestjs/common';
import { Cart, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma-service/prisma-service.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCartOrCreate(data: Prisma.CartCreateInput): Promise<Cart> {
    const userId = data.user.connect.id;
    return await this.prisma.cart.upsert({
      where: { userId: userId },
      create: data,
      update: {},
      include: { CartFood: { include: { food: true } } },
    });
  }

  async deleteCart(args: Prisma.CartDeleteArgs): Promise<Cart> {
    const { where } = args;
    return await this.prisma.cart.delete({
      where,
      include: { CartFood: { include: { food: true } } },
    });
  }

  async updateTotalPriceByCartId(id: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { id },
      include: { CartFood: { include: { food: true } } },
    });
    let totalPrice = 0;
    for (const cartFood of cart.CartFood) {
      totalPrice += cartFood.count * Number(cartFood.food.price);
    }
    return await this.prisma.cart.update({
      where: { id },
      data: { totalPrice },
    });
  }
}
