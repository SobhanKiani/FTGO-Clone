import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Prisma } from '@prisma/client';
import { IAddOrUpdateCartFood } from 'src/interfaces/cart-food/cart-food-create-or-update-response.interface';
import { IDeleteCartFoodResponse } from 'src/interfaces/cart-food/cart-food-delete.interface';
import { CartFoodService } from '../../services/cart-food/cart-food.service';
import { UserService } from '../../services/user/user.service';

@Controller('cart-food')
export class CartFoodController {
    constructor(
        private cartFoodService: CartFoodService,
        private userService: UserService,
    ) { }

    @MessagePattern({ cmd: "update_cart" })
    async addOrUpdateFood(params: { cartId: number, foodId: number, userId: string, count: number }): Promise<IAddOrUpdateCartFood> {
        const { cartId, foodId, userId, count } = params;
        try {
            const userData = await this.userService.getUserByUniqueInfo({ id: userId });
            if (!userData.cart || userData.cart.id !== cartId) {
                return {
                    status: HttpStatus.FORBIDDEN,
                    message: "Forbidden",
                    data: null,
                    errors: { cart: { path: "cart", message: "forbidden" } }
                }
            }
            if (count < 1) {
                return {
                    status: HttpStatus.BAD_REQUEST,
                    message: "Could Not Update Food Cart",
                    data: null,
                    errors: { cart: { path: "cart", message: "count number should be at least 1" } }
                }
            }
            const data: Prisma.CartFoodCreateInput = {
                cart: { connect: { id: cartId } },
                food: { connect: { id: foodId } },
                count: count
            }

            const cartFood = await this.cartFoodService.addOrUpdateCartByFood(data);
            return {
                status: HttpStatus.OK,
                message: "Cart Updated",
                data: cartFood,
                errors: null
            }
        } catch (e) {
            console.log(e);
            return {
                status: HttpStatus.BAD_REQUEST,
                message: "Could Not Update The Cart",
                data: null,
                errors: e
            }
        }

    }

    @MessagePattern({ cmd: "delete_food_from_cart" })
    async deleteFoodFromCart(params: { cartFoodId: number, userId: string, cartId: number }): Promise<IDeleteCartFoodResponse> {
        const { cartFoodId, userId, cartId } = params
        const where = {
            id: cartFoodId,
        }
        try {
            const userData = await this.userService.getUserByUniqueInfo({ id: userId });
            if (userData.cart.id !== cartId) {
                return {
                    status: HttpStatus.FORBIDDEN,
                    message: "Forbidden",
                    data: null,
                    errors: { cart: { path: "cart", message: "forbidden" } }
                }
            }
            const deletedCartFood = await this.cartFoodService.deleteCartFood({ where });
            if (!deletedCartFood) {
                return {
                    status: HttpStatus.NOT_FOUND,
                    message: "Food Not Found In Cart",
                    data: null,
                    errors: { cart: { path: "cart", message: "not found" } }
                }
            }
            return {
                status: HttpStatus.OK,
                message: "Food Deleted From Cart",
                data: deletedCartFood,
                errors: null
            }
        } catch (e) {
            return {
                status: HttpStatus.BAD_REQUEST,
                message: "Could Not Delete The Food From Cart",
                data: null,
                errors: e
            }
        }


    }
}
