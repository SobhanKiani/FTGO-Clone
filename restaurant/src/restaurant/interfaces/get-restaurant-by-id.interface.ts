import { Restaurant } from '../models/restaurant.model';
import { IBaseResponse } from './base-response.interface';

export interface IGetRestaurantByIdResult extends IBaseResponse {
  data: Restaurant | null;
}
