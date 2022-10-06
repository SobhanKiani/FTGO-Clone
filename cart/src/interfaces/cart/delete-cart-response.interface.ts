import { Cart } from "@prisma/client";
import { IBaseResponse } from "../../utils/base-response.interface";

export interface IDeleteCartResponse extends IBaseResponse {
    data: Cart | null
}