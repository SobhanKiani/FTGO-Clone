import { AuthService } from './auth.service';
import { LoginDTO } from './dto&params/login.dto';
import { SignUpDTO } from './dto&params/signUp.dto';
import { UserIdParam } from './dto&params/user-detail.param';
import { UserUpdateDTO } from './dto&params/user-update.dto';
import { VerifyUserDTO } from './dto&params/verifyUser.dto';
import { User } from './models/user.model';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    check(): {
        Check_Status: string;
    };
    signUp(signUpDTO: SignUpDTO): Promise<{
        user: User;
        token: string;
    }>;
    login(loginDTO: LoginDTO): Promise<{
        user: User;
        token: string;
    }>;
    updateUser(userUpdateDTO: UserUpdateDTO, user: User): Promise<User & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    verifyUser(verifyUserDTO: VerifyUserDTO): Promise<User>;
    verifyAdmin(verifyUserDTO: VerifyUserDTO): Promise<User>;
    makeUserAdmin(params: UserIdParam): Promise<User>;
}
