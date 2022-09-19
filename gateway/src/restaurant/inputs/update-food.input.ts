import { Field, InputType, Int } from "@nestjs/graphql";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

@InputType()
export class UpdateFoodInput {
    @Field({ nullable: true })
    @IsString()
    name?: string;

    @Field({ nullable: true })
    @IsString()
    category?: string;

    @Field((type) => Int, { nullable: true })
    @IsNumber()
    price?: number;

    @Field((type) => Boolean, { nullable: true })
    isAvailable?: boolean

}