import { IBaseResponse } from 'src/interfaces/base-response.interface';
import { CartFood } from 'src/models/cart/cart-food.model';

export interface IAddOrUpdateCartFood extends IBaseResponse {
  data: CartFood | null;
}
