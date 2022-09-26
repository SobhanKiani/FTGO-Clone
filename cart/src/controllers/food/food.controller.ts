import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ICreateFoodEvent } from '../../interfaces/events/create-food.event';
import { ICreateCartFoodResponse } from '../../interfaces/food/create-food-response.interface';
import { FoodService } from '../../services/food/food.service';

@Controller('food')
export class FoodController {
    constructor(
        private foodService: FoodService
    ) { }

    @MessagePattern({ cmd: "create_food" })
    async createFood(data: ICreateFoodEvent): Promise<ICreateCartFoodResponse> {
        try {
            const food = await this.foodService.createFood(data);
            return {
                status: HttpStatus.CREATED,
                message: "Food Create In Cart Microservice",
                data: food,
                errors: null
            }
        } catch (e) {
            return {
                status: HttpStatus.BAD_REQUEST,
                message: "Could Not Create Food",
                data: null,
                errors: e
            }
        }
    }
}
