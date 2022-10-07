import { User } from '@prisma/client';
import { IBaseResponse } from '../base-response.interface';

export interface ICreateUserCart extends IBaseResponse {
  data: User | null;
}
