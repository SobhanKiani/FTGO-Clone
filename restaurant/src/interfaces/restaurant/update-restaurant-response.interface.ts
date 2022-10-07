import { IBaseResponse } from 'src/interfaces/base-response.interface';
import { UpdateResult } from 'typeorm';

export interface IUpdateRestaurantResponse extends IBaseResponse {
  data: UpdateResult;
}
