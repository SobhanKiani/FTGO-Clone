import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFoodDTO } from '../../dto/food/create-food.dto';
import { UpdateFoodDTO } from '../../dto/food/update-food.dto';
import { FilterFoodQuery } from '../../filters/food/filter-food.query';
import { Food } from '../../models/food.model';
import { Restaurant } from '../../models/restaurant.model';
import { RateDTO } from '../../dto/food/rate.dto';
import { ClientProxy } from '@nestjs/microservices';
import { ICreateFoodEvent } from '../../interfaces/food/events/create-food.event';
import { IUpdateFoodEvent } from '../../interfaces/food/events/update-food.event';
import { IDeleteFoodEvent } from '../../interfaces/food/events/delete-food.event';

@Injectable()
export class FoodService {
  constructor(
    @InjectRepository(Food) private foodRepository: Repository<Food>,
    @Inject('NATS_SERVICE') private natsClient: ClientProxy,
  ) { }

  async createFood(
    createFoodDto: CreateFoodDTO,
    restaurant: Restaurant,
  ): Promise<Food> {
    const newFood = await this.foodRepository
      .create({ ...createFoodDto, restaurant, isAvailable: true })
      .save();
    const eventData: ICreateFoodEvent = {
      id: newFood.id,
      name: newFood.name,
      category: newFood.category,
      price: newFood.price,
      isAvailable: newFood.isAvailable,
    };
    this.natsClient.emit<any, ICreateFoodEvent>(
      { cmd: 'create_food' },
      eventData,
    );
    return await this.foodRepository.save(newFood);
  }

  async getFoodById(id: number) {
    const food = await this.foodRepository.findOne({
      where: [{ id: id }],
      relations: {
        restaurant: true,
      },
    });
    return food;
  }

  async updateFood(id: number, foodUpdateDto: UpdateFoodDTO) {
    const food = await this.foodRepository.update(id, foodUpdateDto);
    const eventData: IUpdateFoodEvent = {
      id: id,
      data: {
        ...foodUpdateDto,
      },
    };
    this.natsClient.emit<any, IUpdateFoodEvent>(
      { cmd: 'update_food' },
      eventData,
    );
    return food;
  }

  async deleteFood(id: number) {
    const result = await this.foodRepository.delete({ id });
    const eventData: IDeleteFoodEvent = {
      id: id,
    };
    this.natsClient.emit<any, IDeleteFoodEvent>(
      { cmd: 'delete_food' },
      eventData,
    );
    return result;
  }

  async getFoodList(filters: FilterFoodQuery) {
    const { name = '', category = '', restaurantId, isAvailable } = filters;

    const query = this.foodRepository.createQueryBuilder('food');
    if (name) {
      query.where('food.name LIKE :name', { name: `%${name}%` });
    }
    if (category) {
      query.where('food.category LIKE :category', {
        category: `%${category}%`,
      });
    }
    if (restaurantId) {
      query.where('food.restaurant.id = :restaurantId', {
        restaurantId: `${restaurantId}`,
      });
    }
    if (isAvailable != undefined) {
      query.where('food.isAvailable = :isAvailable', {
        isAvailable: isAvailable,
      });
    }

    return await query.getMany();
  }

  async rateFood(rateDto: RateDTO) {
    const { rateNumber, foodId } = rateDto;
    const food = await this.getFoodById(foodId);
    if (!food) {
      return null;
    }
    if (rateNumber < 1 || rateNumber > 5) {
      throw new Error('Rate Is Not In The Boundry');
    }
    const rateSum = food.rate * food.rateCount;
    const newRateCount = food.rateCount + 1;
    const newRate = (rateSum + rateNumber) / newRateCount;
    return await this.foodRepository.update(
      { id: foodId },
      { rate: newRate, rateCount: newRateCount },
    );
  }
}
