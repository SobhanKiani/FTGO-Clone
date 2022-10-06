import { CartFood } from "@prisma/client";
import { IBaseResponse } from "../../utils/base-response.interface";

export interface IDeleteCartFoodResponse extends IBaseResponse {
    data: CartFood | null;
}