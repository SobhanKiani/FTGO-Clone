import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Document } from 'mongoose';
import { Role } from '../enums/roles.enum';
import {
  EMAIL_REGEX,
  PASSWORD_REGEX,
  PHONE_NUMBER_REGEX,
} from '../utils/regex';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.password;
      ret.id = ret._id;
      delete ret._id;
    },
  },
})
export class User extends Document {
  @Prop({
    type: String,
    required: [true, 'Email Address Is Required'],
    unique: true,
    validate: [(email) => EMAIL_REGEX.test(email), 'Email Is Not Valid'],
    trim: true,
    lowercase: true,
  })
  email: string;

  @Prop({
    type: String,
    required: [true, 'Firstname Is Required'],
    trim: true,
  })
  firstName: string;

  @Prop({
    type: String,
    required: [true, 'Lastname Is Required'],
    trim: true,
  })
  lastName: string;

  @Prop({
    type: String,
    required: [true, 'Password Is Required'],
    trim: true,
  })
  password: string;

  @Prop({
    type: String,
    required: [true, 'Phone Number Is Required'],
    trim: true,
    validate: [
      (phoneNumber) => PHONE_NUMBER_REGEX.test(phoneNumber),
      'Phone Number Is Not Valid',
    ],
  })
  phoneNumber: string;

  @Prop({
    type: String,
    required: false,
    trim: true,
  })
  address: string;

  @Prop({
    type: [String],
    default: ['User'],
    required: [true, 'Roles Are Reuqired'],
    enum: [Role],
  })
  roles: string[];

  isPasswordValid: (password: string) => boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.isPasswordValid = async function (password: string) {
  const user = this;
  const isValid = await bcrypt.compare(password, user.password);
  return isValid;
};
