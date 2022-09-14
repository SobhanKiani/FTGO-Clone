import { IsNotEmpty, IsNumber, IsNumberString, Max, Min } from "class-validator";

export class RateDTO {
    @Max(5)
    @Min(0)
    @IsNumberString()
    @IsNotEmpty()
    rateNumber: number;

    @IsNumber()
    @IsNotEmpty()
    restaurantId: number;
}