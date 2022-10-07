import { Food } from '@prisma/client';
import { IBaseResponse } from '../base-response.interface';

export interface ICreateCartFoodResponse extends IBaseResponse {
  data: Food | null;
}
