import { IBaseResponse } from '../../base-response.interface';

export interface IUpdateRestaurantResponse extends IBaseResponse {
  data: { affected: number; raw: any } | null;
}
