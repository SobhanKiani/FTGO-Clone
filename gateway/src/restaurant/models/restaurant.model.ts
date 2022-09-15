import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Restaurant {
    @Field((type) => Int)
    id: number;

    @Field()
    name: string;

    @Field()
    address: string;

    @Field()
    category: string;

    @Field()
    ownerId: string

    // @Field()
    // foods:Food[]

    @Field((type) => Int)
    rate: number;

    @Field((type) => Int)
    rateCount: number;
}