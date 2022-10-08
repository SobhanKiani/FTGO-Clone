import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { RestaurantService } from '../../services/restaurant/restaurant.service';
import { CreateFoodDTO } from '../../dto/food/create-food.dto';
import { UpdateFoodDTO } from '../../dto/food/update-food.dto';
import { ICreateFoodResponse } from '../../interfaces/food/create-food-response.interface';
import { IDeleteFoodResponse } from '../../interfaces/food/delete-food-response.interface';
import { IUpdateFoodResponse } from '../../interfaces/food/update-food-response.interface';
import { FilterFoodQuery } from '../../filters/food/filter-food.query';
import { FoodService } from '../../services/food/food.service';
import { IGetFoodList } from '../../interfaces/food/get-food-list-response.interface';
import { RateDTO } from '../../dto/food/rate.dto';
import { IRate } from '../../interfaces/food/rate-response.interface';

@Controller('food')
export class FoodController {
  constructor(
    private foodService: FoodService,
    private restaurantService: RestaurantService,
  ) {}

  //create
  @MessagePattern({ cmd: 'create_food' })
  async createFood(params: {
    createFoodDto: CreateFoodDTO;
    requestorId: string;
  }): Promise<ICreateFoodResponse> {
    const { requestorId, createFoodDto } = params;

    try {
      const restaurant = await this.restaurantService.getRestaurantById(
        createFoodDto.restaurantId,
      );
      if (!restaurant) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Food Not Found',
          data: null,
          errors: { food: { path: 'food', message: 'food not found' } },
        };
      }

      if (restaurant.ownerId != requestorId) {
        return {
          status: HttpStatus.FORBIDDEN,
          message: 'Forbidden',
          data: null,
          errors: { food: { path: 'food', message: 'forbidden' } },
        };
      }

      const newFood = await this.foodService.createFood(
        createFoodDto,
        restaurant,
      );

      return {
        status: HttpStatus.CREATED,
        message: 'Food Created',
        data: newFood,
        errors: null,
      };
    } catch (e) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Could Not Create The Food',
        data: null,
        errors: e,
      };
    }
  }

  //update
  @MessagePattern({ cmd: 'update_food' })
  async updateFood(params: {
    updateFoodDto: UpdateFoodDTO;
    requestorId: string;
    foodId: number;
  }): Promise<IUpdateFoodResponse> {
    const { requestorId, updateFoodDto, foodId } = params;
    try {
      const food = await this.foodService.getFoodById(foodId);
      if (!food) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Food Not Found',
          data: null,
          errors: { food: { path: 'food', message: 'food not found' } },
        };
      }

      if (food.restaurant.ownerId != requestorId) {
        return {
          status: HttpStatus.FORBIDDEN,
          message: 'Forbidden',
          data: null,
          errors: { food: { path: 'food', message: 'forbidden' } },
        };
      }
      const updateResult = await this.foodService.updateFood(
        foodId,
        updateFoodDto,
      );

      // const eventData: IUpdateFoodEvent = {
      //     id: foodId,
      //     data: {
      //         ...updateFoodDto
      //     }
      // }
      // this.natsClient.emit<any, IUpdateFoodEvent>({ cmd: "update_food" }, eventData)

      return {
        status: HttpStatus.OK,
        message: 'Food Updated',
        data: updateResult,
        errors: null,
      };
    } catch (e) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Could Not Update The Food',
        data: null,
        errors: e,
      };
    }
  }

  //delete
  @MessagePattern({ cmd: 'delete_food' })
  async deleteFood(params: {
    requestorId: string;
    foodId: number;
  }): Promise<IDeleteFoodResponse> {
    const { requestorId, foodId } = params;

    try {
      const food = await this.foodService.getFoodById(foodId);
      if (!food) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Food Not Found',
          data: null,
          errors: { food: { path: 'food', message: 'food not found' } },
        };
      }

      if (food.restaurant.ownerId != requestorId) {
        return {
          status: HttpStatus.FORBIDDEN,
          message: 'Forbidden',
          data: null,
          errors: { food: { path: 'food', message: 'forbidden' } },
        };
      }

      const deleteResult = await this.foodService.deleteFood(foodId);

      // const eventData: IDeleteFoodEvent = {
      //     id: foodId
      // }
      // this.natsClient.emit<any, IDeleteFoodEvent>({ cmd: "delete_food" }, eventData);

      return {
        status: HttpStatus.OK,
        message: 'Food Deleted',
        data: deleteResult,
        errors: null,
      };
    } catch (e) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Could Not Update The Food',
        data: null,
        errors: e,
      };
    }
  }
  //getList
  @MessagePattern({ cmd: 'get_food_list' })
  async getFoodList(filter: FilterFoodQuery): Promise<IGetFoodList> {
    return {
      status: HttpStatus.OK,
      message: 'Food List',
      data: await this.foodService.getFoodList(filter),
      errors: null,
    };
  }

  //getById
  @MessagePattern({ cmd: 'get_food_by_id' })
  async getFoodById(params: { foodId: number }) {
    const { foodId } = params;
    const food = await this.foodService.getFoodById(foodId);

    if (!food) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'Food Not Found',
        data: null,
        errors: { food: { path: 'food', message: 'food not found' } },
      };
    }

    return {
      status: HttpStatus.OK,
      message: 'Food Data Retrieved',
      data: food,
      errors: null,
    };
  }

  @MessagePattern({ cmd: 'rate_food' })
  async rateFood(params: {
    requestorId: string;
    rateDto: RateDTO;
  }): Promise<IRate> {
    const { requestorId, rateDto } = params;
    try {
      if (!requestorId) {
        return {
          status: HttpStatus.FORBIDDEN,
          message: 'Forbidden',
          data: null,
          errors: { rate: { path: 'food', message: 'forbidden' } },
        };
      }
      const rateResult = await this.foodService.rateFood(rateDto);
      if (!rateResult) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Food Not Found',
          data: null,
          errors: { rate: { path: 'food', message: 'not found' } },
        };
      }
      return {
        status: HttpStatus.OK,
        message: 'Food Rated',
        data: rateResult,
        errors: null,
      };
    } catch (e) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Could Not Rate The Food',
        data: null,
        errors: e,
      };
    }
  }
}
