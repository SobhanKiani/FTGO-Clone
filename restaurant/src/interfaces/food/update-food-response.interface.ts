import { UpdateResult } from 'typeorm';
import { IBaseResponse } from '../base-response.interface';

export interface IUpdateFoodResponse extends IBaseResponse {
  data: UpdateResult | null;
}
