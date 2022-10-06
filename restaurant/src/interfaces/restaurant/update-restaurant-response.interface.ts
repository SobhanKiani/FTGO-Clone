import { IBaseResponse } from 'src/utils/base-response.interface';
import { UpdateResult } from 'typeorm';

export interface IUpdateRestaurantResponse extends IBaseResponse {
  data: UpdateResult;
}
