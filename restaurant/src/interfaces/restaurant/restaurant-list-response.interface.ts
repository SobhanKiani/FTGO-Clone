import { IBaseResponse } from 'src/utils/base-response.interface';
import { Restaurant } from '../../models/restaurant.model';

export interface IRestaurantListResponse extends IBaseResponse {
  data: Restaurant[];
}
