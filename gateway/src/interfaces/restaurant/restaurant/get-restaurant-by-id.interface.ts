import { Restaurant } from '../../../models/restaurant/restaurant.model';
import { IBaseResponse } from '../../base-response.interface';

export interface IGetRestaurantByIdResult extends IBaseResponse {
  data: Restaurant | null;
}
