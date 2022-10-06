import { Food } from '../../models/food.model';
import { IBaseResponse } from '../../utils/base-response.interface';

export interface ICreateFoodResponse extends IBaseResponse {
  data: Food | null;
}
