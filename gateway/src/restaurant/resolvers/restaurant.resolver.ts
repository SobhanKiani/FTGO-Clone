import { HttpException, HttpStatus, Inject, UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Parent, ResolveField, Resolver, Query } from "@nestjs/graphql";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { GetUser } from "src/authentication/decorators/get-user-from-request.decorator";
import { IsPrivate } from "src/authentication/decorators/is-private.decorator";
import { Roles } from "src/authentication/decorators/roles.decorator";
import { Role } from "src/authentication/enums/roles.enum";
import { RolesGuard } from "src/authentication/guards/roles.guard";
import { User } from "src/authentication/models/user.model";
import { RestaurantFilterArgs } from "../args/restaurant-filter.args";
import { CreateRestaurantInput } from "../inputs/create-restaurant.input";
import { RateRestaurantInput } from "../inputs/rate-restaurant.input";
import { UpdateRestaurantInput } from "../inputs/update-restaurant.input";
import { ICreateRestaurantResponse } from "../interfaces/create-restaurant-response.interface";
import { IDeleteRestaurantResponse } from "../interfaces/delete-restaurant-response.interface";
import { IGetFoodList } from "../interfaces/get-food-list-response.interface";
import { IGetRestaurantByIdResult } from "../interfaces/get-restaurant-by-id.interface";
import { IRate } from "../interfaces/rate-response.interface";
import { IRestaurantListResponse } from "../interfaces/restaurant-list-response.interface";
import { IUpdateRestaurantResponse } from "../interfaces/update-restaurant-response.interface";
import { Restaurant } from "../models/restaurant.model";
import { UpdateResult } from "../models/update-result.model";

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

    @Mutation((returns) => UpdateResult)
    @IsPrivate(true)
    @Roles(Role.RestaurantOwner)
    @UseGuards(RolesGuard)
    async updateResaurant(
        @Args('updateRestaurantData') updateRestaurantData: UpdateRestaurantInput,
        @Args('id', { type: () => Int }) id: number,
        @GetUser() user: User,
    ) {
        const data = {
            requestorId: user.id,
            id: id,
            updateRestaurantDto: updateRestaurantData,
        }
        const result = await firstValueFrom(this.restaurantClient.send<IUpdateRestaurantResponse>({ cmd: "update_restaurant" }, data));
        if (result.status !== HttpStatus.OK) {
            throw new HttpException({ message: result.message, errors: result.errors }, result.status);
        }
        return result.data;
    }

    @Mutation((returns) => Restaurant)
    @IsPrivate(true)
    @Roles(Role.RestaurantOwner)
    @UseGuards(RolesGuard)
    async deleteRestaurant(
        @Args('id', { type: () => Int }) id: number,
        @GetUser() user: User,
    ) {
        const data = {
            requestorId: user.id,
            restaurantId: id
        }
        const result = await firstValueFrom(this.restaurantClient.send<IDeleteRestaurantResponse>({ cmd: "delete_restaurant" }, data));
        if (result.status !== HttpStatus.OK) {
            throw new HttpException({ message: result.message, errors: result.errors }, result.status);
        }
        return result.data
    }

    @Query((returns) => [Restaurant])
    async getRestaurantList(
        @Args({ type: () => RestaurantFilterArgs }) filter: RestaurantFilterArgs
    ) {
        const result = await firstValueFrom(this.restaurantClient.send<IRestaurantListResponse>({ cmd: "get_restaurant_list" }, filter));
        if (result.status !== HttpStatus.OK) {
            throw new HttpException({ message: result.message, errors: result.errors }, result.status);
        }
        return result.data;
    }

    @Query((returns) => Restaurant)
    async getRestaurantById(
        @Args('id', { type: () => Int }) id: number,
    ) {
        const result = await firstValueFrom(this.restaurantClient.send<IGetRestaurantByIdResult>({ cmd: "get_restaurant_by_id" }, id));
        if (result.status !== HttpStatus.OK) {
            throw new HttpException({ message: result.message, errors: result.errors }, result.status);
        }
        return result.data;
    }


    @Mutation((restaurant) => UpdateResult)
    @IsPrivate(true)
    async rateRestaurant(
        @Args('rateData') rateData: RateRestaurantInput,
        @GetUser() user: User
    ) {
        const data = {
            rateDto: rateData,
            requestorId: user.id
        }
        const result = await firstValueFrom(this.restaurantClient.send<IRate>({ cmd: "rate_restaurant" }, data));
        if (result.status !== HttpStatus.OK) {
            throw new HttpException({ message: result.message, errors: result.errors }, result.status);
        }
        return result.data;
    }

    @ResolveField()
    async foods(@Parent() restaurant: Restaurant) {
        const { id: parentId } = restaurant;
        const filter = { restaurantId: parentId }
        const result = await firstValueFrom(this.restaurantClient.send<IGetFoodList>({ cmd: "get_food_list" }, filter));
        if (result.status !== HttpStatus.OK) {
            throw new HttpException({ message: result.message, errors: result.errors }, result.status);
        }
        return result.data;
    }
}