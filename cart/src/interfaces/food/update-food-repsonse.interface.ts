import { Food } from '@prisma/client';
import { IBaseResponse } from '../base-response.interface';

export interface IUpdateCartFoodResponse extends IBaseResponse {
  data: Food | null;
}
