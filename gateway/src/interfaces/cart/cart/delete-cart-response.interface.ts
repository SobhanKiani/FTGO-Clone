import { IBaseResponse } from 'src/interfaces/base-response.interface';
import { Cart } from 'src/models/cart/cart.model';

export interface IDeleteCartResponse extends IBaseResponse {
  data: Cart | null;
}
