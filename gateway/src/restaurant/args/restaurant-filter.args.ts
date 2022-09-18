import { ArgsType, Field } from "@nestjs/graphql";
import { IsString } from "class-validator";

@ArgsType()
export class RestaurantFilterArgs {
    @Field((type) => String, { nullable: true })
    @IsString()
    name?: string;

    @Field((type) => String, { nullable: true })
    @IsString()
    category: string;
}