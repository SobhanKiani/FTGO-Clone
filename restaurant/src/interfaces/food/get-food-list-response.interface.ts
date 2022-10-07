import { Food } from '../../models/food.model';
import { IBaseResponse } from '../base-response.interface';

export interface IGetFoodList extends IBaseResponse {
  data: Food[] | null;
}
