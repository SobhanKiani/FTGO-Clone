import { Field, Int, ObjectType, Float, } from "@nestjs/graphql";
import { GraphQLJSONObject } from "graphql-type-json";
import { Cart } from "../cart/cart.model";

@ObjectType()
export class Order {
    @Field((type) => Int)
    id: number;

    @Field((type) => Int)
    cartId: number;

    @Field((type) => String)
    userId: string;

    @Field((type) => String, { nullable: true })
    address: string;

    @Field((type) => String)
    phoneNumber: string;

    @Field((type) => String)
    userFullName: string;

    @Field((type) => Float)
    price: number;

    @Field((type) => [GraphQLJSONObject], { nullable: 'items' })
    foods: { count: number, name: string, singlePrice: number | string }

    @Field((type) => Date)
    createdAt: Date;

    @Field((type) => Date)
    updatedAt: Date;

}