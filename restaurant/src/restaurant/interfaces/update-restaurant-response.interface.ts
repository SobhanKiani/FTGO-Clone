import { UpdateResult } from "typeorm";
import { Restaurant } from "../models/restaurant.model";
import { IBaseResponse } from "./base-response.interface";

export interface IUpdateRestaurantResponse extends IBaseResponse {
    data: UpdateResult
}