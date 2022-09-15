import { Controller, HttpStatus, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern, } from '@nestjs/microservices';
import { CreateRestaurantDTO } from '../dtos/createRestaurant.dto';
import { RateDTO } from '../dtos/rate.dto';
import { UpdateRestaurantDTO } from '../dtos/updateRestaurant.dto';
import { ICreateRestaurantResponse } from '../interfaces/create-restaurant-response.interface';
import { IGetRestaurantByIdResult } from '../interfaces/get-restaurant-by-id.interface';
import { IRate } from '../interfaces/rate-response.interface';
import { IRestaurantListResponse } from '../interfaces/restaurant-list-response.interface';
import { IUpdateRestaurantResponse } from '../interfaces/update-restaurant-response.interface';
import { FilterRestaurantQuery } from '../queries/filter-restaurant.query';
import { RestaurantService } from '../services/restaurant.service';

@Controller('restaurant')
export class RestaurantController {
    constructor(
        private readonly restaurantService: RestaurantService,
        @Inject('AUTHENTICATION_SERVICE') private readonly authClient: ClientProxy,
    ) { }

    @MessagePattern({ cmd: "create_restaurant" })
    async createRestaurant(createRestaurantDto: CreateRestaurantDTO): Promise<ICreateRestaurantResponse> {

        try {
            const restaurant = await this.restaurantService.createRestaurant(createRestaurantDto);
            if (restaurant.id) {
                this.authClient.emit({ cmd: "restaurant_created" }, { id: restaurant.ownerId });
            }
            return {
                status: HttpStatus.CREATED,
                message: "Restaurant Created",
                data: restaurant,
                errors: null
            };
        } catch (e) {
            console.log(e);
            return {
                status: HttpStatus.BAD_REQUEST,
                message: "Failed To Create The Restaurant",
                data: null,
                errors: e
            };
        }
    }


    @MessagePattern({ cmd: "update_restaurant" })
    async updateRestaurant(params: { requestorId: string, id: number, updateRestaurantDto: UpdateRestaurantDTO }): Promise<IUpdateRestaurantResponse> {
        try {
            const restaurant = await this.restaurantService.getRestaurantById(params.id,);
            if (!restaurant) {
                return {
                    status: HttpStatus.NOT_FOUND,
                    message: "Restaurant Not Found",
                    data: null,
                    errors: {
                        restaurant: {
                            path: "restaurant", message: "not found"
                        }
                    }
                };
            }

            if (restaurant.ownerId != params.requestorId) {
                return {
                    status: HttpStatus.FORBIDDEN,
                    message: "forbidden",
                    data: null,
                    errors: {
                        restaurant: {
                            path: "restaurant", message: "Forbidden"
                        }
                    }
                };
            }
            const updatedRestaurant = await this.restaurantService.updateRestaurant(restaurant.id, params.updateRestaurantDto)
            return {
                status: HttpStatus.OK,
                message: "Restaurant Updated",
                data: updatedRestaurant,
                errors: null
            }
        } catch (e) {
            return {
                status: HttpStatus.BAD_REQUEST,
                message: "Could Not Update The Restaurant",
                data: null,
                errors: e
            };
        }
    }


    @MessagePattern({ cmd: "delete_restaurant" })
    async deleteRestauarnt(
        params: { requestorId: string, restaurantId: number }
    ) {
        const { requestorId, restaurantId } = params;

        try {
            const restaurant = await this.restaurantService.getRestaurantById(restaurantId);
            if (!restaurant) {
                return {
                    status: HttpStatus.NOT_FOUND,
                    message: "Restaurant Not Found",
                    data: null,
                    errors: {
                        restaurant: {
                            path: "restaurant", message: "not found"
                        }
                    }
                };
            }

            if (restaurant.ownerId != requestorId) {
                return {
                    status: HttpStatus.FORBIDDEN,
                    message: "Retaurant Could Not Delete The Restaurant",
                    data: null,
                    errors: {
                        restaurant: {
                            path: "restaurant", message: "Forbidden"
                        }
                    }
                };
            }

            const deleteRestaurant = await this.restaurantService.deleteRestaurant(restaurantId);

            if (deleteRestaurant.affected == 1) {
                return {
                    status: HttpStatus.OK,
                    message: "Restaurant Deleted",
                    data: restaurant,
                    errors: null
                };
            } else {
                return {
                    status: HttpStatus.BAD_REQUEST,
                    message: "Could Not Delete The Restaurant",
                    data: null,
                    errors: {
                        restaurant: {
                            path: "restaurant", message: "could not delete the restaurantƒ"
                        }
                    }
                };
            }
        } catch (e) {
            return {
                status: HttpStatus.BAD_REQUEST,
                message: "Could Not Delete The Restaurant",
                data: null,
                errors: {
                    restaurant: {
                        path: "restaurant", message: "could not delete the restaurantƒ"
                    }
                }
            };
        }

    }


    @MessagePattern({ cmd: 'get_restaurant_list' })
    async getRestaurantList(filter: FilterRestaurantQuery): Promise<IRestaurantListResponse> {
        const list = await this.restaurantService.getRestaurants(filter);
        return {
            status: HttpStatus.OK,
            message: "Restaurant List",
            data: list,
            errors: null
        };
    }

    @MessagePattern({ cmd: 'get_restaurant_by_id' })
    async getRestaurantById(id: number): Promise<IGetRestaurantByIdResult> {
        const restaurant = await this.restaurantService.getRestaurantById(id);
        if (!restaurant) {
            return {
                status: HttpStatus.NOT_FOUND,
                message: "Retaurant Not Found",
                data: null,
                errors: { restaurant: { path: "restaurant", message: "restaurant not found" } }
            }
        }
        return {
            status: HttpStatus.OK,
            message: "Successfull",
            data: restaurant,
            errors: null
        }


    }

    //get restaurant foods; 
    // @MessagePattern({ cmd: "get_restaurant_foods" })
    // async getRestaurantFoods(params: { restaurantId: number }): Promise<IGetFoodList> {
    //     const { restaurantId } = params;
    //     const restaurantWithFoods = await this.restaurantService.getRestaurantFoods(restaurantId,);
    //     if (!restaurantWithFoods) {
    //         return {
    //             status: HttpStatus.NOT_FOUND,
    //             message: "Restaurant Not Found",
    //             data: null,
    //             errors: { restaurant: { path: "restaurant", message: "not found" } }
    //         }
    //     }
    //     return {
    //         status: HttpStatus.OK,
    //         message: "Foods Retrieved",
    //         data: restaurantWithFoods.foods,
    //         errors: null
    //     }
    // }

    //rate restaurant 
    @MessagePattern({ cmd: "rate_restaurant" })
    async rateRestauarant(params: { requestorId: string, rateDto: RateDTO }): Promise<IRate> {
        const { requestorId, rateDto } = params;
        try {
            if (!requestorId) {
                return {
                    status: HttpStatus.FORBIDDEN,
                    message: "Forbidden",
                    data: null,
                    errors: { rate: { path: "restaurant", message: 'forbidden' } }
                }
            }
            const rateResult = await this.restaurantService.rateRestaurant(rateDto)
            if (!rateResult) {
                return {
                    status: HttpStatus.NOT_FOUND,
                    message: "Restaurant Not Found",
                    data: null,
                    errors: { rate: { path: "restaurant", message: "not found" } }
                }
            }
            return {
                status: HttpStatus.OK,
                message: "Restaurant Rated",
                data: rateResult,
                errors: null
            }
        } catch (e) {
            return {
                status: HttpStatus.BAD_REQUEST,
                message: "Could Not Rate The Restaurant",
                data: null,
                errors: e
            }
        }
    }


}
