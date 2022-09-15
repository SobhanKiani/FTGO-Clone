import { IBaseResponse } from "./base-response.interface";
import { Restaurant } from '../models/restaurant.model'

export interface ICreateRestaurantResponse extends IBaseResponse {
    data: Restaurant | null
}