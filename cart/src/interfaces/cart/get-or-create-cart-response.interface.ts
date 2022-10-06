import { Cart } from "@prisma/client";
import { IBaseResponse } from "../../utils/base-response.interface";

export interface IGetOrCreateCartResponse extends IBaseResponse {
    data: Cart | null
}