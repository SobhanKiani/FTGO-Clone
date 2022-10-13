import { Order } from "src/models/order/order.model";
import { IBaseResponse } from "../../../../order/src/interfaces/base-response.interface";

export interface ICreateOrderResponse extends IBaseResponse {
    data: Order | null
}