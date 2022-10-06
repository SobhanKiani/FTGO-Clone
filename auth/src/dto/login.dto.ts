import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { PASSWORD_REGEX } from '../utils/regex';

export class LoginDTO {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @Matches(PASSWORD_REGEX)
  @IsString()
  @IsNotEmpty()
  password: string;
}
