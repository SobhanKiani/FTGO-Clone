import { Restaurant } from "../../restaurant/models/restaurant.model";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Food {
    @Field()
    id: number;

    @Field()
    name: string;

    @Field()
    category: string;

    @Field()
    price: number;

    // @ManyToOne(() => Restaurant, (restaurant) => restaurant.foods)
    // restaurant: Restaurant;

    @Field()
    isAvailable: boolean;

    @Field()
    rate: number;

    @Field()
    rateCount: number;

}