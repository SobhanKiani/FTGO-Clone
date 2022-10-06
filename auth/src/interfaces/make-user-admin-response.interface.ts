import { User } from '../models/user.model';
import { IBaseResponse } from '../utils/base-response.interface';

export interface IMakeUserAdmin extends IBaseResponse {
  data: User | null;
}
