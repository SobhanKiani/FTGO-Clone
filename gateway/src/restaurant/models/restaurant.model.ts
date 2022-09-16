import { Field, ObjectType } from '@nestjs/graphql';
import { Food } from './food.model';

@ObjectType()
export class Restaurant {
    @Field()
    id: number;

    @Field()
    name: string

    @Field()
    address: string

    @Field()
    category: string

    @Field()
    ownerId: string

    @Field(type => [Food], {nullable:'items'})
    foods: Food[]

    @Field()
    rate: number

    @Field()
    rateCount: number;
}
