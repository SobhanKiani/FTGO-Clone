import { Restaurant } from "../models/restaurant.model";
import { IBaseResponse } from "./base-response.interface";

export interface IRestaurantListResponse extends IBaseResponse {
    data: Restaurant[]
}