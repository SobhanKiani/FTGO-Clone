import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CheckStatus {
  @Field()
  Check_Status: string;
}
