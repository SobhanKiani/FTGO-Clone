import { Field, ObjectType } from '@nestjs/graphql';
import { Role } from '../enums/roles.enum';

@ObjectType()
export class User {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  phoneNumber: string;

  @Field({ nullable: true })
  address?: string;

  @Field((type) => [String], { nullable: false, defaultValue: [Role.User] })
  roles?: string[];
}
