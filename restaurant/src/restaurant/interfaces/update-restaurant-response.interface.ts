import { UpdateResult } from 'typeorm';
import { IBaseResponse } from './base-response.interface';

export interface IUpdateRestaurantResponse extends IBaseResponse {
  data: UpdateResult;
}
