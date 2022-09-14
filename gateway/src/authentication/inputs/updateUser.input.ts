import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { PASSWORD_REGEX, PHONE_NUMBER_REGEX } from 'src/utils/regex';

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

  // @Field()
  // @Matches(PASSWORD_REGEX)
  // @IsString()
  // @IsNotEmpty()
  // password?: string;

  @Field({ nullable: true })
  @Matches(PHONE_NUMBER_REGEX)
  @IsString()
  phoneNumber: string;

  @Field({ nullable: true })
  @IsString()
  address?: string;
}
