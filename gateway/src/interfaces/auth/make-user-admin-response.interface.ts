import { User } from 'src/models/auth/user.model';
import { IBaseResponse } from '../base-response.interface';

export interface IMakeUserAdmin extends IBaseResponse {
  data: User | null;
}
