import { User } from 'src/models/auth/user.model';
import { IBaseResponse } from '../base-response.interface';

export interface ILoginResponse extends IBaseResponse {
  data: { user: User; token: string } | null;
}
