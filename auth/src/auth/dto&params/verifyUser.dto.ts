import { IsString, IsNotEmpty } from 'class-validator'
export class VerifyUserDTO {
    @IsString()
    @IsNotEmpty()
    token: string
}