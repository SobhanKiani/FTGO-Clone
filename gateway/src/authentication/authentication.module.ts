import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { User } from './models/user.model';
import { AuthResolver } from './resolvers/auth.resolvers';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'ftgo-auth',
          port: 9991,
        },
      },
    ]),
  ],
  providers: [
    RolesGuard,
    AuthResolver,
    User,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [RolesGuard, User],
})
export class AuthenticationModule { }
