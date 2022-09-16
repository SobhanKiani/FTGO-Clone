import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { NotAuthenticatedException } from 'src/utils/NotAuthenticatedException';

export const GetUser = createParamDecorator(
  (data, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    if (request.user) {
      return request.user;
    } else {
      throw new NotAuthenticatedException();
    }
  },
);
