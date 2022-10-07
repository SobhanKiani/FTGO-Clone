import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString, Matches } from 'class-validator';
import { PHONE_NUMBER_REGEX } from 'src/utils/regex';

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  @IsEmail()
  @IsString()
  email?: string;

  @Field({ nullable: true })
  @IsString()
  firstName?: string;

  @Field({ nullable: true })
  @IsString()
  lastName?: string;

  @Field({ nullable: true })
  @Matches(PHONE_NUMBER_REGEX)
  @IsString()
  phoneNumber: string;

  @Field({ nullable: true })
  @IsString()
  address?: string;
}
