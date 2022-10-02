import { Cart } from "src/cart/models/cart.model";
import { IBaseResponse } from "../base-response.interface";

export interface IDeleteCartResponse extends IBaseResponse {
    data: Cart | null
}