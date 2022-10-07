import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class DeleteFoodFromCartInput {
  @Field()
  cartId: number;

  @Field()
  cartFoodId: number;
}
