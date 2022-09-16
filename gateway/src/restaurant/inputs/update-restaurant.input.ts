import { Field, InputType } from "@nestjs/graphql";
import { IsString } from "class-validator";

@InputType()
export class UpdateRestaurantInput {
    @Field({ nullable: true })
    @IsString()
    name?: string;

    @Field({ nullable: true })
    @IsString()
    address?: string;

    @Field({ nullable: true })
    @IsString()
    category?: string;
}