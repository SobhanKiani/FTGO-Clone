import { Food } from '@prisma/client';
import { IBaseResponse } from '../base-response.interface';

export interface IDeleteCartFoodResponse extends IBaseResponse {
  data: Food | null;
}
