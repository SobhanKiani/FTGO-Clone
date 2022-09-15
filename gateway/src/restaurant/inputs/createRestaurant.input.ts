import { Field, InputType } from "@nestjs/graphql";
import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

@InputType()
export class CreateRestaurantInput {
    @Field()
    @IsString()
    @IsNotEmpty()
    name: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    address: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    category: string;

}