import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { CartFood } from "./cart-food.model";

@ObjectType()
export class Cart {
    @Field(type => Int)
    id: number;

    @Field()
    userId: string;

    @Field(type => [CartFood], { nullable: 'items' })
    CartFood: CartFood[]

    @Field(type => Float)
    totalPrice: number;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}