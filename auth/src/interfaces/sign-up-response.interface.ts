import { User } from '../models/user.model';
import { IBaseResponse } from './base-response.interface';

export interface ISignUpResponse extends IBaseResponse {
  data: { user: User; token: string } | null;
}
