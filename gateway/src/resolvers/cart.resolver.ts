import { HttpException, HttpStatus, Inject, UseGuards } from '@nestjs/common';
import { Mutation, Resolver, Query, Args } from '@nestjs/graphql';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { UserIdArg } from 'src/args/auth/userId.args';
import { GetUser } from 'src/decorators/get-user-from-request.decorator';
import { IsPrivate } from 'src/decorators/is-private.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/roles.enum';
import { RolesGuard } from 'src/guards/roles.guard';
import { DeleteFoodFromCartInput } from 'src/inputs/cart/delete-food-from-cart.input';
import { IAddOrUpdateCartFood } from 'src/interfaces/cart/cart-food/cart-food-create-or-update-response.interface';
import { IDeleteCartFoodResponse } from 'src/interfaces/cart/cart-food/cart-food-delete.interface';
import { User } from 'src/models/auth/user.model';
import { Cart } from 'src/models/cart/cart.model';
import { AddOrUpdateFoodInCartInput } from '../inputs/cart/add-or-update-food-in-cart.input';
import { IDeleteCartResponse } from '../interfaces/cart/cart/delete-cart-response.interface';
import { IGetOrCreateCartResponse } from '../interfaces/cart/cart/get-or-create-cart-response.interface';
import { CartFood } from '../models/cart/cart-food.model';

@Resolver((of) => Cart)
export class CartResolver {
  constructor(
    @Inject('CART_SERVICE') private readonly cartClient: ClientProxy,
  ) {}

  @Query((returns) => Cart)
  @IsPrivate(true)
  @Roles(Role.User)
  @UseGuards(RolesGuard)
  async getUserCart(@GetUser() user: User) {
    const pattern = { cmd: 'user_cart' };
    const result = await firstValueFrom(
      this.cartClient.send<IGetOrCreateCartResponse, { userId: string }>(
        pattern,
        {
          userId: user.id,
        },
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

  @Mutation((reutrns) => Cart)
  @IsPrivate(true)
  @Roles(Role.User)
  @UseGuards(RolesGuard)
  async deleteCart(@GetUser() user: User) {
    const pattern = { cmd: 'delete_cart' };
    const result = await firstValueFrom(
      this.cartClient.send<IDeleteCartResponse, UserIdArg>(pattern, {
        userId: user.id,
      }),
    );
    if (result.status !== HttpStatus.OK) {
      throw new HttpException(
        { message: result.message, errors: result.errors },
        result.status,
      );
    }
    return result.data;
  }

  @Mutation((reutrns) => CartFood)
  @IsPrivate(true)
  @Roles(Role.User)
  @UseGuards(RolesGuard)
  async addOrUpdateCartFood(
    @Args('addOrUpdateFoodInCartData')
    addOrUpdateFoodInCartData: AddOrUpdateFoodInCartInput,
    @GetUser() user: User,
  ) {
    const pattern = { cmd: 'update_cart' };
    const data = {
      ...addOrUpdateFoodInCartData,
      userId: user.id,
    };
    const result = await firstValueFrom(
      this.cartClient.send<
        IAddOrUpdateCartFood,
        AddOrUpdateFoodInCartInput & UserIdArg
      >(pattern, data),
    );
    if (result.status !== HttpStatus.OK) {
      throw new HttpException(
        { message: result.message, errors: result.errors },
        result.status,
      );
    }
    return result.data;
  }

  @Mutation((reutrns) => CartFood)
  @IsPrivate(true)
  @Roles(Role.User)
  @UseGuards(RolesGuard)
  async deleteFoodFromCart(
    @Args('deleteFoodFromCartData')
    deleteFoodFromCartData: DeleteFoodFromCartInput,
    @GetUser() user: User,
  ) {
    const pattern = { cmd: 'delete_food_from_cart' };
    const data = {
      ...deleteFoodFromCartData,
      userId: user.id,
    };
    const result = await firstValueFrom(
      this.cartClient.send<
        IDeleteCartFoodResponse,
        DeleteFoodFromCartInput & UserIdArg
      >(pattern, data),
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
