import { IBaseResponse } from 'src/interfaces/base-response.interface';
import { UpdateResult } from 'typeorm';

export interface IRate extends IBaseResponse {
  data: UpdateResult | null;
}
