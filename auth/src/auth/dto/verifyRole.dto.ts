import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyRoleDTO {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString({ each: true })
  roles: string[];
}
