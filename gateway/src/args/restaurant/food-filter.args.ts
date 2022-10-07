import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

@ArgsType()
export class FilterFoodQuery {
  @Field({ nullable: true })
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsString()
  category?: string;

  @Field((type) => Boolean, { nullable: true })
  @IsBoolean()
  isAvailable?: boolean;

  @Field((type) => Int, { nullable: true })
  @IsNumber()
  restaurantId?: number;
}
