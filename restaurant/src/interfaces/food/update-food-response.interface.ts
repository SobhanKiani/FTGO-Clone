import { UpdateResult } from 'typeorm';
import { IBaseResponse } from '../../utils/base-response.interface';

export interface IUpdateFoodResponse extends IBaseResponse {
  data: UpdateResult | null;
}
