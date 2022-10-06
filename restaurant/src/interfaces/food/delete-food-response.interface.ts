import { DeleteResult } from 'typeorm';
import { IBaseResponse } from '../../utils/base-response.interface';

export interface IDeleteFoodResponse extends IBaseResponse {
  data: DeleteResult | null;
}
