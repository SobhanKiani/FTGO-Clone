import { Restaurant } from '../../../models/restaurant/restaurant.model';
import { IBaseResponse } from '../../base-response.interface';

export interface IRestaurantListResponse extends IBaseResponse {
  data: Restaurant[];
}
