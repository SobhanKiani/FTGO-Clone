import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { PASSWORD_REGEX, PHONE_NUMBER_REGEX } from 'src/utils/regex';

@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @Field()
  @Matches(PASSWORD_REGEX)
  @IsString()
  @IsNotEmpty()
  password: string;

  @Field()
  @Matches(PHONE_NUMBER_REGEX)
  @IsString()
  phoneNumber: string;
}
