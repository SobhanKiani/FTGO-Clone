import { HttpException, HttpStatus, Inject, UseGuards } from "@nestjs/common";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { GetUser } from "src/authentication/decorators/get-user-from-request.decorator";
import { IsPrivate } from "src/authentication/decorators/is-private.decorator";
import { Roles } from "src/authentication/decorators/roles.decorator";
import { Role } from "src/authentication/enums/roles.enum";
import { RolesGuard } from "src/authentication/guards/roles.guard";
import { User } from "src/authentication/models/user.model";
import { CreateFoodInput } from "../inputs/create-food.input";
import { ICreateFoodResponse } from "../interfaces/create-food.interface";
import { Food } from "../models/food.model";

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
}