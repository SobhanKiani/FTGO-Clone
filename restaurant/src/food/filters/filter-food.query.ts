import { IsBoolean, IsNumber, IsString } from "class-validator";

export class FilterFoodQuery {
    @IsString()
    name?: string;

    @IsString()
    category?: string;

    @IsBoolean()
    isAvailable?: boolean;

    @IsNumber()
    restaurantId?: number

}