import { IsOptional, IsString, Matches } from 'class-validator';
import { EMAIL_REGEX } from '../utils/regex';

export class UserUpdateDTO {
  @Matches(EMAIL_REGEX)
  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;
}
