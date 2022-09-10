import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './services/auth.service';
import { UserSchemaObject } from './DbSchemaObjects/user.schema-object';
import { AuthController } from './controllers/auth.controller';
import { jwtConstants } from './jwt/constants';
import { JwtStrategy } from './jwt/jwt-startegt.class';
import { RolesGuard } from './jwt/roles.guard';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([UserSchemaObject]),
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: {
        expiresIn: '30d',
      },
    }),
    ClientsModule.register([
      { name: 'ORDER_SERVICE', transport: Transport.NATS },
    ]),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    RolesGuard,
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
