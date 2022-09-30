import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { AuthenticationModule } from './authentication/authentication.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [
    AuthenticationModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema/schema.gql'),
    }),
    RestaurantModule,
    CartModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
