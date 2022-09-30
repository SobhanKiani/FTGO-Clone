import { Cart } from "src/cart/models/cart.mode";
import { IBaseResponse } from "../base-response.interface";

export interface IGetOrCreateCartResponse extends IBaseResponse {
    data: Cart | null
}