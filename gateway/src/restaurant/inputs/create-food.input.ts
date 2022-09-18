import { Field, InputType, Int } from "@nestjs/graphql";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { type } from "os";

@InputType()
export class CreateFoodInput {
    @Field()
    @IsString()
    @IsNotEmpty()
    name: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    category: string;

    @Field((type) => Int)
    @IsNumber()
    @IsNotEmpty()
    price: number;

    @Field((type) => Int)
    @IsNumber()
    @IsNotEmpty()
    restaurantId: number
}