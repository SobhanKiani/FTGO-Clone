import { UpdateResult } from 'typeorm';
import { IBaseResponse } from '../base-response.interface';

export interface IRate extends IBaseResponse {
  data: UpdateResult | null;
}
