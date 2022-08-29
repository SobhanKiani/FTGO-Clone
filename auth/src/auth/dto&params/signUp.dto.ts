import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MATCHES,
  Matches,
} from 'class-validator';
import { PASSWORD_REGEX, PHONE_NUMBER_REGEX } from '../utils/regex';

export class SignUpDTO {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @Matches(PASSWORD_REGEX)
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @Matches(PHONE_NUMBER_REGEX)
  @IsString()
  phoneNumber: string;
}
