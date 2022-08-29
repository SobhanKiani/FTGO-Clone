import {
    BadRequestException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { LoginDTO } from './dto&params/login.dto';
import { SignUpDTO } from './dto&params/signUp.dto';
import { UserUpdateDTO } from './dto&params/user-update.dto';
import { JWTPayload } from './jwt/jwt-payload';
import { User, UserDocument } from './models/user.model';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private jwtService: JwtService,
        @Inject('ORDER_SERVICE') private orderClient: ClientProxy,
    ) { }

    async signUp(signUpDTO: SignUpDTO): Promise<{ token: string; user: User }> {
        try {
            const newUser = new this.userModel(signUpDTO);
            await newUser.save();
            const token = await this.createToken(newUser);

            this.orderClient.emit('NEW_USER_CREATED', newUser);

            return {
                user: newUser,
                token,
            };
        } catch (error) {
            throw new BadRequestException(error.errors);
        }
    }

    async login(loginDTO: LoginDTO): Promise<{ token: string; user: User }> {
        const user = await this.userModel.findOne({ email: loginDTO.email });

        if (!user || !await user.isPasswordValid(loginDTO.password)) {
            throw new BadRequestException('Could Not Login With This Crientials');
        }

        const token = await this.createToken(user);
        return {
            user,
            token,
        };
    }

    async updateUser(id: mongoose.Types.ObjectId, userUpdateDTO: UserUpdateDTO) {
        const user = await this.userModel.findById(id);
        if (!user) {
            throw new NotFoundException('User Not Found')
        }
        user.set(userUpdateDTO);
        await user.save()
        this.orderClient.emit('USER_UPDATE', user);
        return user;
    }

    async createToken(user: User) {
        try {
            return await this.jwtService.sign({ id: user.id, email: user.email });
        } catch (error) {
            throw new BadRequestException('Could Generate JWT');
        }
    }

    async makeUserAdmin(id: mongoose.Types.ObjectId): Promise<User> {
        const user = await this.userModel.findById(id)
        if (!user) {
            throw new NotFoundException('User Not Found');
        }
        if (!user.roles.includes('Admin')) {
            user.roles.push('Admin');
        }
        await user.save();
        return user;
    }

    async decodeToken(token: string): Promise<User> {
        const decodedToken = this.jwtService.decode(token) as JWTPayload;
        const user = await this.userModel.findById(decodedToken.id);
        if (!user) {
            throw new NotFoundException('User Not Found');
        }
        return user
    }

}
