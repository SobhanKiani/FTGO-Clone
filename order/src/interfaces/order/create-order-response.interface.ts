import { Order } from "@prisma/client";
import { IBaseResponse } from "../base-response.interface";

export interface ICreateOrderResponse extends IBaseResponse {
    data: Order | null
}