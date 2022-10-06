import { IBaseResponse } from 'src/utils/base-response.interface';
import { UpdateResult } from 'typeorm';

export interface IRate extends IBaseResponse {
  data: UpdateResult | null;
}
