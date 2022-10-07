import { Field, ObjectType } from '@nestjs/graphql';
import { User } from './user.model';

@ObjectType()
export class AuthData {
  @Field((type) => User)
  user: User;

  @Field()
  token: string;
}
