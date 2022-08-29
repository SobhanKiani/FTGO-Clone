import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';
import { User } from '../models/user.model';
import { NotAuthenticatedException } from '../utils/NotAuthenticatedException';

export const GetUser = createParamDecorator(
  (data, req: ExecutionContext): User => {
    const user = req.switchToHttp().getRequest().user;
    if (!user) {
      throw new NotAuthenticatedException();
    }
    return user;
  },
);
