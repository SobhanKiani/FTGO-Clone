import { CartFood } from "@prisma/client";
import { IBaseResponse } from "../base-response.interface";

export interface IAddOrUpdateCartFood extends IBaseResponse {
    data: CartFood | null;
}