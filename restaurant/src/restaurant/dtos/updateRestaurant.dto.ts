import { IsString } from "class-validator";

export class UpdateRestaurantDTO {
    @IsString()
    name?: string;

    @IsString()
    address?: string;

    @IsString()
    category?: string;
}