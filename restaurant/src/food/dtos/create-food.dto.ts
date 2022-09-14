import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateFoodDTO {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    category: string;

    @IsNumber()
    @IsNotEmpty()
    price: number;

    @IsNumber()
    @IsNotEmpty()
    restaurantId: number
}