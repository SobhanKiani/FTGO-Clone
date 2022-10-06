import { User } from '../models/user.model';
import { IBaseResponse } from '../utils/base-response.interface';

export interface ILoginResponse extends IBaseResponse {
  data: { user: User; token: string } | null;
}
