import { HttpException, HttpStatus, Inject, UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Resolver, Query } from '@nestjs/graphql';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GetUser } from 'src/decorators/get-user-from-request.decorator';
import { IsPrivate } from 'src/decorators/is-private.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/roles.enum';
import { RolesGuard } from 'src/guards/roles.guard';
import { RateFoodInput } from 'src/inputs/restaurant/rate-food.input';
import { UpdateFoodInput } from 'src/inputs/restaurant/update-food.input';
import { ICreateFoodResponse } from 'src/interfaces/restaurant/food/create-food.interface';
import { IDeleteFoodResponse } from 'src/interfaces/restaurant/food/delete-food-response.interface';
import { IGetFoodByIdResponse } from 'src/interfaces/restaurant/food/get-food-by-id-reponse.interface';
import { IGetFoodList } from 'src/interfaces/restaurant/food/get-food-list-response.interface';
import { IRate } from 'src/interfaces/restaurant/food/rate-response.interface copy';
import { IUpdateFoodResponse } from 'src/interfaces/restaurant/food/update-food-response.interface';
import { User } from 'src/models/auth/user.model';
import { UpdateResult } from 'src/models/restaurant/update-result.model';
import { FilterFoodQuery } from '../args/restaurant/food-filter.args';
import { CreateFoodInput } from '../inputs/restaurant/create-food.input';
import { Food } from '../models/restaurant/food.model';

@Resolver((oƒ) => Food)
export class FoodResovler {
  constructor(
    @Inject('RESTAURANT_SERVICE')
    private readonly restaurantClient: ClientProxy,
  ) {}

  @Mutation((returns) => Food)
  @IsPrivate(true)
  @Roles(Role.RestaurantOwner)
  @UseGuards(RolesGuard)
  async createFood(
    @Args('createFoodData') createFoodData: CreateFoodInput,
    @GetUser() user: User,
  ) {
    const data = {
      requestorId: user.id,
      createFoodDto: createFoodData,
    };
    const result = await firstValueFrom(
      this.restaurantClient.send<
        ICreateFoodResponse,
        { createFoodDto: CreateFoodInput; requestorId: string }
      >({ cmd: 'create_food' }, data),
    );
    if (result.status !== HttpStatus.CREATED) {
      throw new HttpException(
        { message: result.message, errors: result.errors },
        result.status,
      );
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
    @GetUser() user: User,
  ) {
    const data = {
      foodId: id,
      requestorId: user.id,
      updateFoodDto: updateFoodData,
    };
    const result = await firstValueFrom(
      this.restaurantClient.send<IUpdateFoodResponse, {}>(
        { cmd: 'update_food' },
        data,
      ),
    );
    if (result.status !== HttpStatus.OK) {
      throw new HttpException(
        { message: result.message, errors: result.errors },
        result.status,
      );
    }
    return result.data;
  }

  @Mutation((returns) => UpdateResult)
  @IsPrivate(true)
  @Roles(Role.RestaurantOwner)
  @UseGuards(RolesGuard)
  async deleteFood(
    @Args('id', { type: () => Int }) id: number,
    @GetUser() user: User,
  ) {
    const data = {
      foodId: id,
      requestorId: user.id,
    };
    const result = await firstValueFrom(
      this.restaurantClient.send<
        IDeleteFoodResponse,
        { foodId: number; requestorId: string }
      >({ cmd: 'delete_food' }, data),
    );
    if (result.status !== HttpStatus.OK) {
      throw new HttpException(
        { message: result.message, errors: result.errors },
        result.status,
      );
    }
    return result.data;
  }

  @Mutation((returns) => UpdateResult)
  @IsPrivate(true)
  async rateFood(
    @Args('rateData') rateData: RateFoodInput,
    @GetUser() user: User,
  ) {
    const data = {
      rateDto: rateData,
      requestorId: user.id,
    };
    const result = await firstValueFrom(
      this.restaurantClient.send<
        IRate,
        { rateDto: RateFoodInput; requestorId: string }
      >({ cmd: 'rate_food' }, data),
    );
    if (result.status !== HttpStatus.OK) {
      throw new HttpException(
        { message: result.message, errors: result.errors },
        result.status,
      );
    }
    return result.data;
  }

  @Query((returns) => Food)
  async getFoodById(@Args('id', { type: () => Int }) id: number) {
    const args = { foodId: id };
    const result = await firstValueFrom(
      this.restaurantClient.send<IGetFoodByIdResponse, { foodId: number }>(
        { cmd: 'get_food_by_id' },
        args,
      ),
    );
    if (result.status !== HttpStatus.OK) {
      throw new HttpException(
        { message: result.message, errors: result.errors },
        result.status,
      );
    }
    return result.data;
  }

  @Query((returns) => [Food])
  async getFoodList(
    @Args({ type: () => FilterFoodQuery }) filter: FilterFoodQuery,
  ) {
    const result = await firstValueFrom(
      this.restaurantClient.send<IGetFoodList, FilterFoodQuery>(
        { cmd: 'get_food_list' },
        filter,
      ),
    );
    if (result.status !== HttpStatus.OK) {
      throw new HttpException(
        { message: result.message, errors: result.errors },
        result.status,
      );
    }
    return result.data;
  }
}
