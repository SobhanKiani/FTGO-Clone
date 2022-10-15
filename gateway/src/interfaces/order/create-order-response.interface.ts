import { Order } from "src/models/order/order.model";
import { IBaseResponse } from "../base-response.interface";

export interface ICreateOrderResponse extends IBaseResponse {
    data: Order | null
}