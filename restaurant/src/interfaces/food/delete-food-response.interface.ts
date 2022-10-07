import { DeleteResult } from 'typeorm';
import { IBaseResponse } from '../base-response.interface';

export interface IDeleteFoodResponse extends IBaseResponse {
  data: DeleteResult | null;
}
