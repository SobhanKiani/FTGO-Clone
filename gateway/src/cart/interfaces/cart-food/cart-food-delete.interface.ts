import { CartFood } from "src/cart/models/cart-food.model";
import { IBaseResponse } from "../base-response.interface";

export interface IDeleteCartFoodResponse extends IBaseResponse {
    data: CartFood | null;
}