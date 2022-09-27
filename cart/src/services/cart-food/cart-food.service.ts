import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import e from 'express';
import { PrismaService } from '../prisma-service/prisma-service.service';

@Injectable()
export class CartFoodService {
    constructor(
        private prisma: PrismaService
    ) { }


    async addOrUpdateCartByFood(data: Prisma.CartFoodCreateInput) {
        const foodId = data.food.connect.id;
        const cartId = data.cart.connect.id;

        const cartFood = await this.prisma.cartFood.findUnique({
            where: {
                foodInCart: {
                    cartId,
                    foodId
                }
            }
        });

        if (!cartFood) {
            return await this.prisma.cartFood.create({
                data: {
                    count: data.count,
                    cart: data.cart,
                    food: data.food
                }
            })
        } else {
            return await this.prisma.cartFood.update({
                where: {
                    foodInCart: {
                        cartId,
                        foodId
                    }
                },
                data: {
                    count: data.count
                }
            })
        }
    }
}
