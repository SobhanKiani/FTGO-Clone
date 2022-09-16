import { HttpException, HttpStatus, Inject } from "@nestjs/common";
import { Args, Mutation, Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { GetUser } from "src/authentication/decorators/get-user-from-request.decorator";
import { IsPrivate } from "src/authentication/decorators/isPrivate.decorator";
import { User } from "src/authentication/models/user.model";
import { CreateRestaurantInput } from "../inputs/createRestaurant.input";
import { ICreateRestaurantResponse } from "../interfaces/create-restaurant-response.interface";
import { Restaurant } from "../models/restaurant.model";

@Resolver((of) => Restaurant)
export class RestaurantResolver {
    constructor(
        @Inject('RESTAURANT_SERVICE') private readonly restaurantClient: ClientProxy,
    ) { }

    @Mutation((returns) => Restaurant)
    @IsPrivate(true)
    async createRestaurant(
        @Args('createRestaurantData') createRestaurantData: CreateRestaurantInput,
        @GetUser() user: User,
    ) {
        const createRestaurantDto = { ...createRestaurantData, ownerId: user.id };
        const result = await firstValueFrom(this.restaurantClient.send<ICreateRestaurantResponse>({ cmd: 'create_restaurant' }, createRestaurantDto));
        if (result.status !== HttpStatus.CREATED) {
            throw new HttpException({ message: result.message, errors: result.errors }, result.status);
        }
        return result.data;
    }

    @ResolveField()
    async foods(@Parent() restaurant: Restaurant) {
        const { id } = restaurant;
        return []
    }
}