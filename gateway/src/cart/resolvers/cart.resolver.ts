import { HttpException, HttpStatus, Inject, UseGuards } from "@nestjs/common";
import { Mutation, Resolver, Query, Args } from "@nestjs/graphql";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { GetUser } from "src/authentication/decorators/get-user-from-request.decorator";
import { IsPrivate } from "src/authentication/decorators/is-private.decorator";
import { Roles } from "src/authentication/decorators/roles.decorator";
import { Role } from "src/authentication/enums/roles.enum";
import { RolesGuard } from "src/authentication/guards/roles.guard";
import { User } from "src/authentication/models/user.model";
import { AddOrUpdateFoodInCartInput } from "../inputs/add-or-update-food-in-cart.input";
import { DeleteFoodFromCartInput } from "../inputs/delete-food-from-cart.input";
import { IAddOrUpdateCartFood } from "../interfaces/cart-food/cart-food-create-or-update-response.interface";
import { IDeleteCartFoodResponse } from "../interfaces/cart-food/cart-food-delete.interface";
import { IDeleteCartResponse } from "../interfaces/cart/delete-cart-response.interface";
import { IGetOrCreateCartResponse } from "../interfaces/cart/get-or-create-cart-response.interface";
import { CartFood } from "../models/cart-food.model";
import { Cart } from "../models/cart.model";

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
        console.log('CART RESULT', result.data.CartFood);
        if (result.status !== HttpStatus.OK) {
            throw new HttpException({ message: result.message, errors: result.errors }, result.status);
        }
        return result.data
    }

    @Mutation((reutrns) => Cart)
    @IsPrivate(true)
    @Roles(Role.User)
    @UseGuards(RolesGuard)
    async deleteCart(
        @GetUser() user: User
    ) {
        const pattern = { cmd: "delete_cart" }
        const result = await firstValueFrom(this.cartClient.send<IDeleteCartResponse>(pattern, { userId: user.id }));
        if (result.status !== HttpStatus.OK) {
            throw new HttpException({ message: result.message, errors: result.errors }, result.status);
        }
        return result.data
    }

    @Mutation((reutrns) => CartFood)
    @IsPrivate(true)
    @Roles(Role.User)
    @UseGuards(RolesGuard)
    async addOrUpdateCartFood(
        @Args('addOrUpdateFoodInCartData') addOrUpdateFoodInCartData: AddOrUpdateFoodInCartInput,
        @GetUser() user: User
    ) {
        const pattern = { cmd: "update_cart" }
        const data = {
            ...addOrUpdateFoodInCartData,
            userId: user.id
        }
        const result = await firstValueFrom(this.cartClient.send<IAddOrUpdateCartFood>(pattern, data));
        if (result.status !== HttpStatus.OK) {
            throw new HttpException({ message: result.message, errors: result.errors }, result.status);
        }
        return result.data
    }

    @Mutation((reutrns) => CartFood)
    @IsPrivate(true)
    @Roles(Role.User)
    @UseGuards(RolesGuard)
    async deleteFoodFromCart(
        @Args('deleteFoodFromCartData') deleteFoodFromCartData: DeleteFoodFromCartInput,
        @GetUser() user: User
    ) {
        const pattern = { cmd: "delete_food_from_cart" }
        const data = {
            ...deleteFoodFromCartData,
            userId: user.id
        }
        const result = await firstValueFrom(this.cartClient.send<IDeleteCartFoodResponse>(pattern, data));
        if (result.status !== HttpStatus.OK) {
            throw new HttpException({ message: result.message, errors: result.errors }, result.status);
        }
        return result.data
    }
}