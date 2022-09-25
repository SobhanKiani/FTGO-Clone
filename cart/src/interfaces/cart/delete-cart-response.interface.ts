import { Cart } from "@prisma/client";
import { IBaseResponse } from "../base-response.interface";

export interface IDeleteCartResponse extends IBaseResponse {
    data: Cart | null
}