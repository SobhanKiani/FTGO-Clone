import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Cart {
    @Field(type => Int)
    id: number;

    @Field()
    userId: string;

    // CartFood: CartFood[]

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}