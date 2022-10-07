import { User } from '../models/user.model';
import { IBaseResponse } from './base-response.interface';

export interface ILoginResponse extends IBaseResponse {
  data: { user: User; token: string } | null;
}
