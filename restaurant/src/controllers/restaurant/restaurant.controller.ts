import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RateDTO } from '../../dto/restaurant/rate.dto';
import { CreateRestaurantDTO } from '../../dto/restaurant/createRestaurant.dto';
import { UpdateRestaurantDTO } from '../../dto/restaurant/updateRestaurant.dto';
import { FilterRestaurantQuery } from '../../filters/restaruant/filter-restaurant.query';
import { IRate } from '../../interfaces/food/rate-response.interface';
import { ICreateRestaurantResponse } from '../../interfaces/restaurant/create-restaurant-response.interface';
import { IGetRestaurantByIdResult } from '../../interfaces/restaurant/get-restaurant-by-id.interface';
import { IRestaurantListResponse } from '../../interfaces/restaurant/restaurant-list-response.interface';
import { IUpdateRestaurantResponse } from '../../interfaces/restaurant/update-restaurant-response.interface';
import { RestaurantService } from '../../services/restaurant/restaurant.service';

@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @MessagePattern({ cmd: 'create_restaurant' })
  async createRestaurant(
    createRestaurantDto: CreateRestaurantDTO,
  ): Promise<ICreateRestaurantResponse> {
    try {
      const restaurant = await this.restaurantService.createRestaurant(
        createRestaurantDto,
      );

      return {
        status: HttpStatus.CREATED,
        message: 'Restaurant Created',
        data: restaurant,
        errors: null,
      };
    } catch (e) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Failed To Create The Restaurant',
        data: null,
        errors: e,
      };
    }
  }

  @MessagePattern({ cmd: 'update_restaurant' })
  async updateRestaurant(params: {
    requestorId: string;
    id: number;
    updateRestaurantDto: UpdateRestaurantDTO;
  }): Promise<IUpdateRestaurantResponse> {
    try {
      const restaurant = await this.restaurantService.getRestaurantById(
        params.id,
      );
      if (!restaurant) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Restaurant Not Found',
          data: null,
          errors: {
            restaurant: {
              path: 'restaurant',
              message: 'not found',
            },
          },
        };
      }

      if (restaurant.ownerId != params.requestorId) {
        return {
          status: HttpStatus.FORBIDDEN,
          message: 'forbidden',
          data: null,
          errors: {
            restaurant: {
              path: 'restaurant',
              message: 'Forbidden',
            },
          },
        };
      }
      const updatedRestaurant = await this.restaurantService.updateRestaurant(
        restaurant.id,
        params.updateRestaurantDto,
      );
      return {
        status: HttpStatus.OK,
        message: 'Restaurant Updated',
        data: updatedRestaurant,
        errors: null,
      };
    } catch (e) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Could Not Update The Restaurant',
        data: null,
        errors: e,
      };
    }
  }

  @MessagePattern({ cmd: 'delete_restaurant' })
  async deleteRestauarnt(params: {
    requestorId: string;
    restaurantId: number;
  }) {
    const { requestorId, restaurantId } = params;

    try {
      const restaurant = await this.restaurantService.getRestaurantById(
        restaurantId,
      );
      if (!restaurant) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Restaurant Not Found',
          data: null,
          errors: {
            restaurant: {
              path: 'restaurant',
              message: 'not found',
            },
          },
        };
      }

      if (restaurant.ownerId != requestorId) {
        return {
          status: HttpStatus.FORBIDDEN,
          message: 'Retaurant Could Not Delete The Restaurant',
          data: null,
          errors: {
            restaurant: {
              path: 'restaurant',
              message: 'Forbidden',
            },
          },
        };
      }

      const deleteRestaurant = await this.restaurantService.deleteRestaurant(
        restaurantId,
      );

      if (deleteRestaurant.affected == 1) {
        return {
          status: HttpStatus.OK,
          message: 'Restaurant Deleted',
          data: restaurant,
          errors: null,
        };
      } else {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Could Not Delete The Restaurant',
          data: null,
          errors: {
            restaurant: {
              path: 'restaurant',
              message: 'could not delete the restaurantƒ',
            },
          },
        };
      }
    } catch (e) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Could Not Delete The Restaurant',
        data: null,
        errors: {
          restaurant: {
            path: 'restaurant',
            message: 'could not delete the restaurantƒ',
          },
        },
      };
    }
  }

  @MessagePattern({ cmd: 'get_restaurant_list' })
  async getRestaurantList(
    filter: FilterRestaurantQuery,
  ): Promise<IRestaurantListResponse> {
    const list = await this.restaurantService.getRestaurants(filter);
    return {
      status: HttpStatus.OK,
      message: 'Restaurant List',
      data: list,
      errors: null,
    };
  }

  @MessagePattern({ cmd: 'get_restaurant_by_id' })
  async getRestaurantById(params: {
    id: number;
  }): Promise<IGetRestaurantByIdResult> {
    const { id } = params;
    const restaurant = await this.restaurantService.getRestaurantById(id);
    if (!restaurant) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'Retaurant Not Found',
        data: null,
        errors: {
          restaurant: { path: 'restaurant', message: 'restaurant not found' },
        },
      };
    }
    return {
      status: HttpStatus.OK,
      message: 'Successfull',
      data: restaurant,
      errors: null,
    };
  }

  @MessagePattern({ cmd: 'rate_restaurant' })
  async rateRestauarant(params: {
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
          errors: { rate: { path: 'restaurant', message: 'forbidden' } },
        };
      }
      const rateResult = await this.restaurantService.rateRestaurant(rateDto);
      if (!rateResult) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Restaurant Not Found',
          data: null,
          errors: { rate: { path: 'restaurant', message: 'not found' } },
        };
      }
      return {
        status: HttpStatus.OK,
        message: 'Restaurant Rated',
        data: rateResult,
        errors: null,
      };
    } catch (e) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Could Not Rate The Restaurant',
        data: null,
        errors: e,
      };
    }
  }
}
