import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class AddOrUpdateFoodInCartInput {
    @Field()
    cartId: number;

    @Field()
    foodId: number;

    @Field()
    count: number;
}