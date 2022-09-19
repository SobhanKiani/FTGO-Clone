import { HttpException, HttpStatus, Inject, UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Resolver, Query } from "@nestjs/graphql";
import { ClientProxy } from "@nestjs/microservices";
import { filter, firstValueFrom } from "rxjs";
import { GetUser } from "src/authentication/decorators/get-user-from-request.decorator";
import { IsPrivate } from "src/authentication/decorators/is-private.decorator";
import { Roles } from "src/authentication/decorators/roles.decorator";
import { Role } from "src/authentication/enums/roles.enum";
import { RolesGuard } from "src/authentication/guards/roles.guard";
import { User } from "src/authentication/models/user.model";
import { FilterFoodQuery } from "../args/food-filter.args";
import { CreateFoodInput } from "../inputs/create-food.input";
import { RateFoodInput } from "../inputs/rate-food.input";
import { UpdateFoodInput } from "../inputs/update-food.input";
import { ICreateFoodResponse } from "../interfaces/create-food.interface";
import { IDeleteFoodResponse } from "../interfaces/delete-food-response.interface";
import { IGetFoodByIdResponse } from "../interfaces/get-food-by-id-reponse.interface";
import { IGetFoodList } from "../interfaces/get-food-list-response.interface";
import { IRate } from "../interfaces/rate-response.interface";
import { IUpdateFoodResponse } from "../interfaces/update-food-response.interface";
import { Food } from "../models/food.model";
import { UpdateResult } from "../models/update-result.model";

@Resolver((oƒ) => Food)
export class FoodResovler {
    constructor(
        @Inject('RESTAURANT_SERVICE') private readonly restaurantClient: ClientProxy
    ) { }

    @Mutation((returns) => Food)
    @IsPrivate(true)
    @Roles(Role.RestaurantOwner)
    @UseGuards(RolesGuard)
    async createFood(
        @Args('createFoodData') createFoodData: CreateFoodInput,
        @GetUser() user: User
    ) {
        const data = {
            requestorId: user.id,
            createFoodDto: createFoodData
        }
        const result = await firstValueFrom(this.restaurantClient.send<ICreateFoodResponse>({ cmd: "create_food" }, data));
        if (result.status !== HttpStatus.CREATED) {
            throw new HttpException({ message: result.message, errors: result.errors }, result.status);
        }
        return result.data;
    }


    @Mutation((returns) => UpdateResult)
    @IsPrivate(true)
    @Roles(Role.RestaurantOwner)
    @UseGuards(RolesGuard)
    async updateFood(
        @Args('updateFoodData') updateFoodData: UpdateFoodInput,
        @Args('id', { type: () => Int }) id: number,
        @GetUser() user: User
    ) {
        const data = {
            foodId: id,
            requestorId: user.id,
            updateFoodDto: updateFoodData
        }
        const result = await firstValueFrom(this.restaurantClient.send<IUpdateFoodResponse>({ cmd: "update_food" }, data));
        if (result.status !== HttpStatus.OK) {
            throw new HttpException({ message: result.message, errors: result.errors }, result.status);
        }
        return result.data;

    }

    @Mutation((returns) => UpdateResult)
    @IsPrivate(true)
    @Roles(Role.RestaurantOwner)
    @UseGuards(RolesGuard)
    async deleteFood(
        @Args('id', { type: () => Int }) id: number,
        @GetUser() user: User
    ) {
        const data = {
            foodId: id,
            requestorId: user.id,
        }
        const result = await firstValueFrom(this.restaurantClient.send<IDeleteFoodResponse>({ cmd: "delete_food" }, data));
        if (result.status !== HttpStatus.OK) {
            throw new HttpException({ message: result.message, errors: result.errors }, result.status);
        }
        return result.data;
    }

    @Mutation((returns) => UpdateResult)
    @IsPrivate(true)
    async rateFood(
        @Args("rateData") rateData: RateFoodInput,
        @GetUser() user: User
    ) {
        const data = {
            rateDto: rateData,
            requestorId: user.id
        }
        const result = await firstValueFrom(this.restaurantClient.send<IRate>({ cmd: "rate_food" }, data));
        if (result.status !== HttpStatus.OK) {
            throw new HttpException({ message: result.message, errors: result.errors }, result.status);
        }
        return result.data;
    }

    @Query((returns) => Food)
    async getFoodById(
        @Args('id', { type: () => Int }) id: number
    ) {
        const params = { foodId: id }
        const result = await firstValueFrom(this.restaurantClient.send<IGetFoodByIdResponse>({ cmd: "get_food_by_id" }, params));
        if (result.status !== HttpStatus.OK) {
            throw new HttpException({ message: result.message, errors: result.errors }, result.status);
        }
        return result.data;
    }

    @Query((returns) => [Food])
    async getFoodList(
        @Args({ type: () => FilterFoodQuery }) filter: FilterFoodQuery
    ) {

        const result = await firstValueFrom(this.restaurantClient.send<IGetFoodList>({ cmd: "get_food_list" }, filter));
        if (result.status !== HttpStatus.OK) {
            throw new HttpException({ message: result.message, errors: result.errors }, result.status);
        }
        return result.data;
    }

}