import { Controller, HttpStatus } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { IUpdateFoodEvent } from 'src/interfaces/events/update-food.event';
import { IDeleteCartFoodResponse } from 'src/interfaces/food/delete-food-response.interface';
import { IUpdateCartFoodResponse } from 'src/interfaces/food/update-food-repsonse.interface';
import { ICreateFoodEvent } from '../../interfaces/events/create-food.event';
import { ICreateCartFoodResponse } from '../../interfaces/food/create-food-response.interface';
import { FoodService } from '../../services/food/food.service';
 
@Controller('food')
export class FoodController {
  constructor(private foodService: FoodService) {}

  @EventPattern({ cmd: 'create_food' })
  async createFood(data: ICreateFoodEvent): Promise<ICreateCartFoodResponse> {
    try {
      const food = await this.foodService.createFood(data);
      return {
        status: HttpStatus.CREATED,
        message: 'Food Create In Cart Microservice',
        data: food,
        errors: null,
      };
    } catch (e) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Could Not Create Food',
        data: null,
        errors: e,
      };
    }
  }

  @EventPattern({ cmd: 'update_food' })
  async updateFood(data: IUpdateFoodEvent): Promise<IUpdateCartFoodResponse> {
    try {
      const { id, data: updateData } = data;
      const updatedFood = await this.foodService.updateFood({ id }, updateData);
      if (!updatedFood) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Food Not Found',
          data: null,
          errors: { food: { path: 'food', message: 'food not found' } },
        };
      }
      return {
        status: HttpStatus.OK,
        message: 'Food Updated In Cart Microservice',
        data: updatedFood,
        errors: null,
      };
    } catch (e) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Could Not Update Food',
        data: null,
        errors: e,
      };
    }
  }

  @EventPattern({ cmd: 'delete_food' })
  async deleteFood(params: { id: number }): Promise<IDeleteCartFoodResponse> {
    const { id } = params;
    const where = { id };
    try {
      const deletedFood = await this.foodService.deleteFood({ where });
      if (!deletedFood) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Food Not Found',
          data: null,
          errors: { food: { path: 'food', message: 'food not found' } },
        };
      }

      return {
        status: HttpStatus.OK,
        message: 'Food Deleted In Cart Microservice',
        data: deletedFood,
        errors: null,
      };
    } catch (e) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Could Not Update Food',
        data: null,
        errors: e,
      };
    }
  }
}
