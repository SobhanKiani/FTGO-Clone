import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { NotAuthenticatedException } from 'src/utils/NotAuthenticatedException';
import { User } from '../models/user.model';

export const GetUser = createParamDecorator(
  (data, req: ExecutionContext): User => {
    const user = req.switchToHttp().getRequest().user;
    if (!user) {
      throw new NotAuthenticatedException();
    }
    return user;
  },
);
