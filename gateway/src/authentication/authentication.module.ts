import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthResolver } from './resolvers/auth.resolvers';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.AUTH_HOST,
          port: Number(process.env.AUTH_PORT),
        },
      },
    ]),
  ],
  providers: [
    RolesGuard,
    AuthResolver,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [],
})
export class AuthenticationModule { }
