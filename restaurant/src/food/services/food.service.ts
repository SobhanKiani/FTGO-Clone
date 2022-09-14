import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFoodDTO } from '../../food/dtos/create-food.dto';
import { UpdateFoodDTO } from '../dtos/update-food.dto';

import { FilterFoodQuery } from '../../food/filters/filter-food.query';
import { Food } from '../models/food.model';
import { Restaurant } from 'src/restaurant/models/restaurant.model';
import { RateDTO } from '../dtos/rate.dto';

@Injectable()
export class FoodService {
    constructor(
        @InjectRepository(Food) private foodRepository: Repository<Food>
    ) { }


    async createFood(createFoodDto: CreateFoodDTO, restaurant: Restaurant): Promise<Food> {
        const newFood = await this.foodRepository.create({ ...createFoodDto, restaurant });
        return await this.foodRepository.save(newFood);
    }

    async getFoodById(id: number) {
        const food = await this.foodRepository.findOne({
            where: [
                { id: id }
            ],
            relations: {
                restaurant: true
            }
        });
        return food;
    }

    async updateFood(id: number, foodUpdateDto: UpdateFoodDTO) {
        return await this.foodRepository.update(id, foodUpdateDto);
    }

    async deleteFood(id: number) {
        return await this.foodRepository.delete({ id });
    }

    async getFoodList(filters: FilterFoodQuery) {
        const { name, category, restaurantId, isAvailable } = filters
        const query = this.foodRepository.createQueryBuilder('food');
        if (name) {
            query.where('food.name LIKE :name', { name: `%${name}%` });
        }
        if (category) {
            query.where('food.category LIKE :category', { category: `%${category}%` });
        }
        if (restaurantId) {
            query.where('food.restaurant.id = :restaurantId', { restaurantId: `%${category}%` });
        }
        if (isAvailable) {
            query.where('food.isAvailable LIKE :isAvailable', { isAvailable: `%${isAvailable}%` });
        }

        return await query.execute();
    }


    async rateFood(rateDto: RateDTO) {
        const { rateNumber, foodId } = rateDto;
        const food = await this.getFoodById(foodId);
        if (!food) {
            return null;
        }
        if (rateNumber < 1 || rateNumber > 5) {
            throw new Error('Rate Is Not In The Boundry')
        }
        const rateSum = food.rate * food.rateCount;
        const newRateCount = food.rateCount + 1;
        const newRate = (rateSum + rateNumber) / newRateCount;
        return await this.foodRepository.update({ id: foodId }, { rate: newRate, rateCount: newRateCount });
    }


}
