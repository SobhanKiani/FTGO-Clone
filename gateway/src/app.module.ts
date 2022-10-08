import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { RolesGuard } from './guards/roles.guard';
import { AuthResolver } from './resolvers/auth.resolvers';
import { CartResolver } from './resolvers/cart.resolver';
import { FoodResovler } from './resolvers/food.resovler';
import { RestaurantResolver } from './resolvers/restaurant.resolver';
import { DateScalar } from './utils/custome-date-scalar';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema/schema.gql'),
    }),
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.AUTH_HOST,
          port: Number(process.env.AUTH_PORT),
        },
      },
      {
        name: 'RESTAURANT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.RESTAURANT_HOST,
          port: Number(process.env.RESTAURANT_PORT),
        },
      },
      {
        name: 'CART_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.CART_HOST,
          port: Number(process.env.CART_PORT),
        },
      },
    ]),
  ],
  controllers: [],
  providers: [
    FoodResovler,
    AuthResolver,
    RestaurantResolver,
    CartResolver,
    RolesGuard,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    DateScalar,
  ],
})
export class AppModule {}
