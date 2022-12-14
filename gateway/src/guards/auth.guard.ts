import {
  CanActivate,
  ExecutionContext,
  Inject,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { IVerifyUserResponse } from 'src/interfaces/auth/verify-user-response.interface';
import { IS_PRIVATE } from '../decorators/is-private.decorator';

export class AuthGuard implements CanActivate, OnApplicationBootstrap {
  constructor(
    private readonly reflector: Reflector,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    const isPrivate = this.reflector.get<string[]>(
      IS_PRIVATE,
      ctx.getHandler(),
    );
    if (!isPrivate) {
      return true;
    }

    const authToken = request.headers?.authorization?.split(' ')[1];

    if (authToken) {
      const authResult = await firstValueFrom(
        this.authClient.send<IVerifyUserResponse>(
          { cmd: 'auth_verify_user' },
          { token: authToken },
        ),
      );

      const user = authResult.data;

      if (user?.email) {
        request.user = user;
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  async onApplicationBootstrap() {
    await this.authClient.connect();
  }
}
