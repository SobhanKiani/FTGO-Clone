import { User } from '../models/user.model';
import { IBaseResponse } from '../utils/base-response.interface';

export interface ISignUpResponse extends IBaseResponse {
  data: { user: User; token: string } | null;
}
