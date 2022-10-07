import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UpdateResult {
  @Field((type) => Int)
  affected: number;

  @Field((type) => String)
  raw: any;
}
