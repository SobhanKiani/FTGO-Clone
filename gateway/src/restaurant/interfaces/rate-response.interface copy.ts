import { IBaseResponse } from "./base-response.interface";

export interface IRate extends IBaseResponse {
    data: { affected: number | null, raw: any } | null;

}