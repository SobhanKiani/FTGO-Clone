import { User } from 'src/models/auth/user.model';
import { IBaseResponse } from '../base-response.interface';

export interface IUpdateUserResponse extends IBaseResponse {
  data: User | null;
}
