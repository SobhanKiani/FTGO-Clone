import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNumber, Max, Min } from 'class-validator';

@InputType()
export class RateFoodInput {
  @Field((type) => Int)
  @IsNumber()
  @Min(1)
  @Max(5)
  rateNumber: number;

  @Field((type) => Int)
  @IsNumber()
  foodId: number;
}
