import { User } from '../models/user.model';
import { IBaseResponse } from '../utils/base-response.interface';

export interface IVerifyUserResponse extends IBaseResponse {
  data: User | null;
}
