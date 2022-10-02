import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Food } from "src/restaurant/models/food.model";

@ObjectType()
export class CartFood {
    @Field(type => Int)
    id: number;

    @Field(type => Int)
    cartId: number;

    @Field(type => Int)
    count: number;

    @Field(type => Food)
    food: Food

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}

