import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Prisma } from '@prisma/client';
import { IDeleteCartResponse } from '../../interfaces/cart/delete-cart-response.interface';
import { IGetOrCreateCartResponse } from '../../interfaces/cart/get-or-create-cart-response.interface';
import { CartService } from '../../services/cart/cart.service';

@Controller('cart')
export class CartController {
    constructor(
        private cartService: CartService
    ) { }


    @MessagePattern({ cmd: "user_cart" })
    async userCart(params: { userId: string }): Promise<IGetOrCreateCartResponse> {
        const { userId } = params
        try {
            const data: Prisma.CartCreateInput = {
                user: {
                    connect: {
                        id: userId
                    }
                }
            }

            const cart = await this.cartService.getCartOrCreate(data);
            return {
                status: HttpStatus.OK,
                message: "User Cart Retrieved",
                data: cart,
                errors: null,
            }

        } catch (e) {
            console.log(e);
            return {
                status: HttpStatus.BAD_REQUEST,
                message: "Could Not Get The Cart",
                data: null,
                errors: e
            }
        }
    }

    @MessagePattern({ cmd: "delete_cart" })
    async deleteCart(params: { userId: string }): Promise<IDeleteCartResponse> {
        const { userId } = params;
        try {
            const args: Prisma.CartDeleteArgs = {
                where: { userId }
            }
            const cart = await this.cartService.deleteCart(args);
            return {
                status: HttpStatus.OK,
                message: "User Cart Deleted",
                data: cart,
                errors: null,
            }
        } catch (e) {
            return {
                status: HttpStatus.BAD_REQUEST,
                message: "Could Not Get The Cart",
                data: null,
                errors: e
            }
        }
    }
}
