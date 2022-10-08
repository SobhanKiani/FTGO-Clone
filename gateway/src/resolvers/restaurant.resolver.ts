import { HttpException, HttpStatus, Inject, UseGuards } from '@nestjs/common';
import {
  Args,
  Int,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
  Query,
} from '@nestjs/graphql';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RestaurantFilterArgs } from 'src/args/restaurant/restaurant-filter.args';
import { GetUser } from 'src/decorators/get-user-from-request.decorator';
import { IsPrivate } from 'src/decorators/is-private.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/roles.enum';
import { RolesGuard } from 'src/guards/roles.guard';
import { CreateRestaurantInput } from 'src/inputs/restaurant/create-restaurant.input';
import { RateRestaurantInput } from 'src/inputs/restaurant/rate-restaurant.input';
import { UpdateRestaurantInput } from 'src/inputs/restaurant/update-restaurant.input';
import { IGetFoodList } from 'src/interfaces/restaurant/food/get-food-list-response.interface';
import { IRate } from 'src/interfaces/restaurant/food/rate-response.interface copy';
import { ICreateRestaurantResponse } from 'src/interfaces/restaurant/restaurant/create-restaurant-response.interface';
import { IDeleteRestaurantResponse } from 'src/interfaces/restaurant/restaurant/delete-restaurant-response.interface';
import { IGetRestaurantByIdResult } from 'src/interfaces/restaurant/restaurant/get-restaurant-by-id.interface';
import { IRestaurantListResponse } from 'src/interfaces/restaurant/restaurant/restaurant-list-response.interface';
import { IUpdateRestaurantResponse } from 'src/interfaces/restaurant/restaurant/update-restaurant-response.interface';
import { User } from 'src/models/auth/user.model';
import { Restaurant } from 'src/models/restaurant/restaurant.model';
import { UpdateResult } from 'src/models/restaurant/update-result.model';

@Resolver((of) => Restaurant)
export class RestaurantResolver {
  constructor(
    @Inject('RESTAURANT_SERVICE')
    private readonly restaurantClient: ClientProxy,
  ) {}

  @Mutation((returns) => Restaurant)
  @IsPrivate(true)
  async createRestaurant(
    @Args('createRestaurantData') createRestaurantData: CreateRestaurantInput,
    @GetUser() user: User,
  ) {
    const createRestaurantDto = { ...createRestaurantData, ownerId: user.id };
    const result = await firstValueFrom(
      this.restaurantClient.send<
        ICreateRestaurantResponse,
        CreateRestaurantInput
      >({ cmd: 'create_restaurant' }, createRestaurantDto),
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
  async updateResaurant(
    @Args('updateRestaurantData') updateRestaurantData: UpdateRestaurantInput,
    @Args('id', { type: () => Int }) id: number,
    @GetUser() user: User,
  ) {
    const data = {
      requestorId: user.id,
      id: id,
      updateRestaurantDto: updateRestaurantData,
    };
    const result = await firstValueFrom(
      this.restaurantClient.send<
        IUpdateRestaurantResponse,
        {
          requestorId: string;
          id: number;
          updateRestaurantDto: UpdateRestaurantInput;
        }
      >({ cmd: 'update_restaurant' }, data),
    );
    if (result.status !== HttpStatus.OK) {
      throw new HttpException(
        { message: result.message, errors: result.errors },
        result.status,
      );
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
      restaurantId: id,
    };
    const result = await firstValueFrom(
      this.restaurantClient.send<
        IDeleteRestaurantResponse,
        { requestorId: string; restaurantId: number }
      >({ cmd: 'delete_restaurant' }, data),
    );
    if (result.status !== HttpStatus.OK) {
      throw new HttpException(
        { message: result.message, errors: result.errors },
        result.status,
      );
    }
    return result.data;
  }

  @Query((returns) => [Restaurant])
  async getRestaurantList(
    @Args({ type: () => RestaurantFilterArgs }) filter: RestaurantFilterArgs,
  ) {
    const result = await firstValueFrom(
      this.restaurantClient.send<IRestaurantListResponse, RestaurantFilterArgs>(
        { cmd: 'get_restaurant_list' },
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

  @Query((returns) => Restaurant)
  async getRestaurantById(@Args('id', { type: () => Int }) id: number) {
    const result = await firstValueFrom(
      this.restaurantClient.send<IGetRestaurantByIdResult, { id: number }>(
        { cmd: 'get_restaurant_by_id' },
        { id },
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

  @Mutation((restaurant) => UpdateResult)
  @IsPrivate(true)
  async rateRestaurant(
    @Args('rateData') rateData: RateRestaurantInput,
    @GetUser() user: User,
  ) {
    const data = {
      rateDto: rateData,
      requestorId: user.id,
    };
    const result = await firstValueFrom(
      this.restaurantClient.send<
        IRate,
        { rateDto: RateRestaurantInput; requestorId: string }
      >({ cmd: 'rate_restaurant' }, data),
    );
    if (result.status !== HttpStatus.OK) {
      throw new HttpException(
        { message: result.message, errors: result.errors },
        result.status,
      );
    }
    return result.data;
  }

  @ResolveField()
  async foods(@Parent() restaurant: Restaurant) {
    const { id: parentId } = restaurant;
    const filter = { restaurantId: parentId };
    const result = await firstValueFrom(
      this.restaurantClient.send<IGetFoodList, { restaurantId: number }>(
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
