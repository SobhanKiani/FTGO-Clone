import { Cart } from "src/cart/models/cart.model";
import { IBaseResponse } from "../base-response.interface";

export interface IGetOrCreateCartResponse extends IBaseResponse {
    data: Cart | null
}