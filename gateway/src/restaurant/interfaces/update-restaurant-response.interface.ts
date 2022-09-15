import { IBaseResponse } from "./base-response.interface";

export interface IUpdateRestaurantResponse extends IBaseResponse {
    data: { affecte: number, raw: any } | null;
}