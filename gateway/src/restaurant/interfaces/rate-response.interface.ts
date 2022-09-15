import { IBaseResponse } from "./base-response.interface";

export interface IRate extends IBaseResponse {
    data: { affected: number, raw: any } | null
}