import { IsMongoId } from 'class-validator';
import mongoose from 'mongoose';

export class UserIdParam {
  @IsMongoId()
  id: mongoose.Types.ObjectId;
}
