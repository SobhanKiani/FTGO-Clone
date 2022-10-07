import { IBaseResponse } from 'src/interfaces/base-response.interface';
import { Restaurant } from '../../models/restaurant.model';

export interface IRestaurantListResponse extends IBaseResponse {
  data: Restaurant[];
}
