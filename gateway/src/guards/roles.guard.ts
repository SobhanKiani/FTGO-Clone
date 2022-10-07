import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/models/auth/user.model';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    const ctx = GqlExecutionContext.create(context);
    if (!requiredRoles) {
      return true;
    } else {
      const user = ctx.getContext().req.user as User;
      if (!user.roles) {
        return false;
      }

      const haveAllTheRoels = requiredRoles.every((role) =>
        user.roles.includes(role),
      );
      return haveAllTheRoels ? true : false;
    }
  }
}
