import { Injectable } from '@nestjs/common';
import { CartFood, Prisma } from '@prisma/client';
import e from 'express';
import { PrismaService } from '../prisma-service/prisma-service.service';

@Injectable()
export class CartFoodService {
    constructor(
        private prisma: PrismaService
    ) { }


    async addOrUpdateCartByFood(data: Prisma.CartFoodCreateInput): Promise<CartFood> {
        const foodId = data.food.connect.id;
        const cartId = data.cart.connect.id;

        const cartFood = await this.prisma.cartFood.findUnique({
            where: {
                foodInCart: {
                    cartId,
                    foodId
                }
            },
            include: { food: true }
        });

        if (!cartFood) {
            return await this.prisma.cartFood.create({
                data: {
                    count: data.count,
                    cart: data.cart,
                    food: data.food
                },
                include: { food: true }
            })
        }
        return await this.prisma.cartFood.update({
            where: {
                foodInCart: {
                    cartId,
                    foodId
                }
            },
            data: {
                count: data.count
            },
            include: { food: true }
        })

    }

    async deleteCartFood(args: Prisma.CartFoodDeleteArgs): Promise<CartFood> {
        try {
            const { where } = args;
            return await this.prisma.cartFood.delete({
                where,
                include: { food: true }
            });
        } catch (e) {
            console.log(e)
        }
    }
}
