import { HttpException, HttpStatus, Inject, UseGuards } from "@nestjs/common";
import { Mutation, Resolver, Query } from "@nestjs/graphql";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { GetUser } from "src/authentication/decorators/get-user-from-request.decorator";
import { IsPrivate } from "src/authentication/decorators/is-private.decorator";
import { Roles } from "src/authentication/decorators/roles.decorator";
import { Role } from "src/authentication/enums/roles.enum";
import { RolesGuard } from "src/authentication/guards/roles.guard";
import { User } from "src/authentication/models/user.model";
import { IGetOrCreateCartResponse } from "../interfaces/cart/get-or-create-cart-response.interface";
import { Cart } from "../models/cart.mode";

@Resolver((of) => Cart)
export class CartResolver {
    constructor(
        @Inject('CART_SERVICE') private readonly cartClient: ClientProxy
    ) { }

    @Query((returns) => Cart)
    @IsPrivate(true)
    @Roles(Role.User)
    @UseGuards(RolesGuard)
    async getUserCart(
        @GetUser() user: User
    ) {
        const pattern = { cmd: "user_cart" }
        const result = await firstValueFrom(this.cartClient.send<IGetOrCreateCartResponse>(pattern, { userId: user.id }));
        if (result.status !== HttpStatus.OK) {
            throw new HttpException({ message: result.message, errors: result.errors }, result.status);
        }
        return result.data
    }
}