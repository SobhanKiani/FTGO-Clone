import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class UpdateFoodDTO {
    @IsString()
    name?: string;

    @IsString()
    category?: string;

    @IsNumber()
    price?: number;

    @IsBoolean()
    isAvailable?: boolean
}