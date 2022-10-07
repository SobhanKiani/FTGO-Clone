import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNumber, Max, Min } from 'class-validator';

@InputType()
export class RateRestaurantInput {
  @Field((type) => Int)
  @IsNumber()
  @Min(1)
  @Max(5)
  rateNumber: number;

  @Field((type) => Int)
  @IsNumber()
  restaurantId: number;
}
