import { Food } from "@prisma/client";
import { IBaseResponse } from "../../utils/base-response.interface";

export interface IUpdateCartFoodResponse extends IBaseResponse {
    data: Food | null;
}