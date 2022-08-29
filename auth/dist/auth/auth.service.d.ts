import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import mongoose, { Model } from 'mongoose';
import { LoginDTO } from './dto&params/login.dto';
import { SignUpDTO } from './dto&params/signUp.dto';
import { UserUpdateDTO } from './dto&params/user-update.dto';
import { User, UserDocument } from './models/user.model';
export declare class AuthService {
    private readonly userModel;
    private jwtService;
    private orderClient;
    constructor(userModel: Model<UserDocument>, jwtService: JwtService, orderClient: ClientProxy);
    signUp(signUpDTO: SignUpDTO): Promise<{
        token: string;
        user: User;
    }>;
    login(loginDTO: LoginDTO): Promise<{
        token: string;
        user: User;
    }>;
    updateUser(id: mongoose.Types.ObjectId, userUpdateDTO: UserUpdateDTO): Promise<User & mongoose.Document<any, any, any> & {
        _id: mongoose.Types.ObjectId;
    }>;
    createToken(user: User): Promise<string>;
    makeUserAdmin(id: mongoose.Types.ObjectId): Promise<User>;
    decodeToken(token: string): Promise<User>;
}
