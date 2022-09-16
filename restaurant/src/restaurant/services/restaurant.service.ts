; import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRestaurantDTO } from '../dtos/createRestaurant.dto';
import { RateDTO } from '../dtos/rate.dto';
import { UpdateRestaurantDTO } from '../dtos/updateRestaurant.dto';
import { Restaurant } from '../models/restaurant.model';
import { FilterRestaurantQuery } from '../queries/filter-restaurant.query';

@Injectable()
export class RestaurantService {
    constructor(
        @InjectRepository(Restaurant) private restaurantRepository: Repository<Restaurant>,
        @Inject('AUTH_SERVICE') private authClient: ClientProxy,
    ) { }


    async createRestaurant(createRestaurantDTO: CreateRestaurantDTO) {
        const restaurant = this.restaurantRepository.create(createRestaurantDTO);
        const savedRestaurant = await this.restaurantRepository.save(restaurant);
        this.authClient.emit({ cmd: "restaurant_created" }, { id: savedRestaurant.ownerId })
        return savedRestaurant
    }

    async updateRestaurant(id: number, updateRestaurantDTO: UpdateRestaurantDTO) {
        return await this.restaurantRepository.update(id, updateRestaurantDTO);
    }

    async getRestaurantById(id: number) {
        return await this.restaurantRepository.findOne({
            where: {
                id
            },
        });
    }

    async deleteRestaurant(id: number) {
        return await this.restaurantRepository.delete({ id: id });
    }

    async getRestaurants(filter: FilterRestaurantQuery) {
        const { category, name } = filter
        const query = this.restaurantRepository.createQueryBuilder('restaurant');

        if (name) {
            query.where('restaurant.name like :name', { name: `%${name}%` });
        }

        if (category) {
            query.where('restaurant.category like :category', { category: `%${category}%` });
        }

        return await query.execute();
    }

    async rateRestaurant(rateDto: RateDTO) {
        const { rateNumber, restaurantId } = rateDto;
        const restaurant = await this.getRestaurantById(restaurantId);
        if (!restaurant) {
            return null;
        }
        if (rateNumber < 1 || rateNumber > 5) {
            throw new Error('Rate Is Not In The Boundry')
        }
        const rateSum = restaurant.rate * restaurant.rateCount;
        const newRateCount = restaurant.rateCount + 1;
        const newRate = (rateSum + rateNumber) / newRateCount;
        return await this.restaurantRepository.update({ id: restaurantId }, { rate: newRate, rateCount: newRateCount });
    }

    // async getRestaurantFoods(restaurantId: number) {
    //     return await this.restaurantRepository.findOne({
    //         where: {
    //             id: restaurantId
    //         },
    //         relations: {
    //             foods: true
    //         },
    //         select: {
    //             foods: true
    //         }
    //     })
    // }
}