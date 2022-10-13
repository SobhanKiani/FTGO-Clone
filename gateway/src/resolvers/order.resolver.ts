import { HttpException, HttpStatus, Inject, UseGuards } from "@nestjs/common";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { GetUser } from "src/decorators/get-user-from-request.decorator";
import { IsPrivate } from "src/decorators/is-private.decorator";
import { Roles } from "src/decorators/roles.decorator";
import { Role } from "src/enums/roles.enum";
import { RolesGuard } from "src/guards/roles.guard";
import { IGetOrCreateCartResponse } from "src/interfaces/cart/cart/get-or-create-cart-response.interface";
import { ICreateOrderResponse } from "src/interfaces/order/create-order-response.interface";
import { User } from "src/models/auth/user.model";
import { Order } from "src/models/order/order.model";

@Resolver((of) => Order)
export class OrderResolver {

    constructor(
        @Inject('CART_SERVICE') private readonly cartClient: ClientProxy,
        @Inject('ORDER_SERVICE') private readonly orderClient: ClientProxy,


    ) { }

    @Mutation((returns) => Order)
    @IsPrivate(true)
    @Roles(Role.Admin)
    @UseGuards(RolesGuard)
    async createOrder(
        @GetUser() user: User,
    ) {
        const cartPattern = { cmd: 'user_cart' };
        const cartResult = await firstValueFrom(
            this.cartClient.send<IGetOrCreateCartResponse, { userId: string }>(
                cartPattern,
                {
                    userId: user.id,
                },
            ),
        );
        if (cartResult.status !== HttpStatus.OK) {
            throw new HttpException(
                { message: cartResult.message, errors: cartResult.errors },
                cartResult.status,
            );
        }

        const data = {
            cartId: cartResult.data.id,
            userId: user.id,
            price: cartResult.data.totalPrice,
            foods: cartResult.data.CartFood.map((cartFood) => cartFood.food)
        }
        const result = await firstValueFrom(
            this.orderClient.send<ICreateOrderResponse, { cartId: number, userId: string, price: number }>({ cmd: "create_order" }, data)
        )

        if (result.status !== HttpStatus.OK) {
            throw new HttpException(
                { message: result.message, errors: cartResult.errors },
                result.status,
            );
        }
        return result.data;

    }
}