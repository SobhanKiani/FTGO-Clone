import { Field, Int, ObjectType, Float, } from "@nestjs/graphql";
import { Cart } from "../cart/cart.model";

@ObjectType()
export class Order {
    @Field((type) => Int)
    id: number;

    @Field((type) => Int)
    cartId: number;

    @Field((type) => String)
    userId: string;

    @Field((type) => String)
    address: string

    @Field((type) => Float)
    price: number;

    @Field((type) => Date)
    createdAt: Date;

    @Field((type) => Date)
    updatedAt: Date;

}