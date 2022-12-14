import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { SignUpDTO } from '../dto/signUp.dto';
import { UserUpdateDTO } from '../dto/user-update.dto';
import { Role } from '../enums/roles.enum';
import { JWTPayload } from '../jwt/jwt-payload';
import { User, UserDocument } from '../models/user.model';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async getUserByEmail(email: string): Promise<User> {
    return await this.userModel.findOne({ email });
  }

  async getUserById(id: mongoose.Types.ObjectId) {
    return await this.userModel.findById(id);
  }

  async createUser(signUpDTO: SignUpDTO) {
    const newUser = new this.userModel(signUpDTO);
    return await newUser.save();
  }

  async comparePassword(user: User, password: string) {
    return user.isPasswordValid(password);
  }

  async updateUser(
    id: mongoose.Types.ObjectId,
    userUpdateDTO: UserUpdateDTO,
  ): Promise<User> {
    return await this.userModel.findByIdAndUpdate(id, userUpdateDTO, {
      new: true,
    });
  }

  async createToken(user: User): Promise<string> {
    return await this.jwtService.sign({ id: user.id, email: user.email });
  }

  async makeUserAdmin(id: mongoose.Types.ObjectId): Promise<User> {
    return await this.userModel.findByIdAndUpdate(
      id,
      { $addToSet: { roles: 'Admin' } },
      { new: true },
    );
  }

  async giveRoleToUser(id: mongoose.Types.ObjectId, role: Role) {
    return await this.userModel.findByIdAndUpdate(
      id,
      { $addToSet: { roles: role } },
      { new: true },
    );
  }

  async decodeToken(token: string): Promise<User> {
    const decodedToken = this.jwtService.decode(token) as JWTPayload;

    if (!decodedToken || !decodedToken.id) {
      return null;
    }

    const user = await this.userModel.findById(decodedToken.id);

    if (!user) {
      return null;
    }

    return user;
  }
}
