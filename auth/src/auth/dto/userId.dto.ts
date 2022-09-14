import { IsMongoId, IsNotEmpty, IsString } from "class-validator";
import mongoose from "mongoose";

export class UserIdDTO {
    @IsMongoId()
    @IsString()
    @IsNotEmpty()
    id: mongoose.Types.ObjectId
}