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
import { IS_PRIVATE } from '../decorators/isPrivate.decorator';
import { User } from '../models/user.model';

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

    const authToken = request.headers.authorization;

    if (authToken) {
      const user = await firstValueFrom(
        this.authClient.send<User>(
          { cmd: 'auth_verify_user' },
          { token: authToken },
        ),
      );

      if (user.email) {
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
