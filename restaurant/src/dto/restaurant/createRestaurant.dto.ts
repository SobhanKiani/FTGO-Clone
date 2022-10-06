import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateRestaurantDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsMongoId()
  @IsString()
  @IsNotEmpty()
  ownerId: string;
}
