import { CartFood } from "@prisma/client";
import { IBaseResponse } from "../../utils/base-response.interface";

export interface IAddOrUpdateCartFood extends IBaseResponse {
    data: CartFood | null;
}