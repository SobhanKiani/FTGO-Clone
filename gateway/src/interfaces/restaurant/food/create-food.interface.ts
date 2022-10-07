import { Food } from '../../../models/restaurant/food.model';
import { IBaseResponse } from '../../base-response.interface';

export interface ICreateFoodResponse extends IBaseResponse {
  data: Food | null;
}
