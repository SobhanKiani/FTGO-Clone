import { IBaseResponse } from "./base-response.interface";

export interface IUpdateFoodResponse extends IBaseResponse {
    data: { affected: number | null, raw: any } | null;
}