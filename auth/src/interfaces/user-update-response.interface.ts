import { IBaseResponse } from 'src/interfaces/base-response.interface';
import { User } from '../models/user.model';

export interface IUpdateUserResponse extends IBaseResponse {
  status: number;
  message: string;
  data: User | null;
  errors: { [key: string]: any } | null;
}
