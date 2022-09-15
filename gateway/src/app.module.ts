import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { AuthenticationModule } from './authentication/authentication.module';
import { RestaurantModule } from './restaurant/restaurant.module';

@Module({
  imports: [
    AuthenticationModule,
    RestaurantModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema/schema.gql'),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
