import { Controller, HttpStatus, Inject, NotFoundException, Param } from '@nestjs/common';
import { ClientProxy, EventPattern, MessagePattern } from '@nestjs/microservices';
import { AuthService } from '../services/auth.service';
import { LoginDTO } from '../dto/login.dto';
import { SignUpDTO } from '../dto/signUp.dto';
import { UserUpdateDTO } from '../dto/user-update.dto';
import { VerifyUserDTO } from '../dto/verifyUser.dto';
import { VerifyRoleDTO } from '../dto/verifyRole.dto';
import mongoose from 'mongoose';
import { ISignUpResponse } from '../interfaces/sign-up-response.interface';
import { ILoginResponse } from '../interfaces/login-response.interface';
import { IUpdateUserResponse } from '../interfaces/user-update-response.interface';
import { IMakeUserAdmin } from '../interfaces/make-user-admin-response.interface';
import { IVerifyUserResponse } from '../interfaces/verify-user-response.interface';
import { UserIdDTO } from '../dto/userId.dto';
import { Role } from '../enums/roles.enum';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @Inject('NATS_SERVICE') private natsClient: ClientProxy,

  ) { }

  @MessagePattern({ cmd: 'auth_check' })
  async check(data: {}): Promise<{ Check_Status: string }> {
    return {
      Check_Status: 'NestJS Auth Is Working, Hello',
    };
  }

  @MessagePattern({ cmd: 'auth_sign_up' })
  async signUp(signUpDTO: SignUpDTO): Promise<ISignUpResponse> {

    try {
      const foundUser = await this.authService.getUserByEmail(signUpDTO.email);
      if (foundUser) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Email Address Already Exists",
          data: null,
          errors: {
            email: { path: "user", message: "Email Address Already Exists" }
          }
        }
      }

      const newUser = await this.authService.createUser(signUpDTO);
      this.natsClient.emit({ cmd: "user_created" }, newUser);
      const token = await this.authService.createToken(newUser);
      const result = {
        token,
        user: newUser
      };

      return {
        status: HttpStatus.CREATED,
        message: 'User Created',
        data: result,
        errors: null
      };
    } catch (e) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: "Could Complete SignUp Request",
        data: null,
        errors: e.errors
      }
    }

  }

  @MessagePattern({ cmd: 'auth_login' })
  async login(loginDTO: LoginDTO): Promise<ILoginResponse> {

    const user = await this.authService.getUserByEmail(loginDTO.email);
    if (!user) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Could Not Login With These Credentials',
        data: null,
        errors: { user: { path: "user", message: "Email Or Password Is Not Correct" } }
      }
    }

    const isPasswordValid = await user.isPasswordValid(loginDTO.password);

    if (!isPasswordValid) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Could Not Login With These Credentials',
        data: null,
        errors: { user: { path: "user", message: "Email Or Password Is Not Correct" } }
      }
    }

    const token = await this.authService.createToken(user);
    const result = {
      user,
      token
    }

    return {
      status: HttpStatus.OK,
      message: 'User Logged In',
      data: result,
      errors: null
    }

  }

  @MessagePattern({ cmd: 'auth_update_user' })
  async updateUser(userUpdateInfo: {
    userUpdateDTO: UserUpdateDTO;
    userId: mongoose.Types.ObjectId;
  }): Promise<IUpdateUserResponse> {

    const updatedUser = await this.authService.updateUser(
      userUpdateInfo.userId,
      userUpdateInfo.userUpdateDTO,
    );

    if (!updatedUser) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: "User Not Found",
        data: null,
        errors: { user: { path: "user", message: "User Not Found" } }
      }
    }

    this.natsClient.emit({ cmd: "user_updated" }, { id: updatedUser.id, data: updatedUser });

    return {
      status: HttpStatus.OK,
      message: "User Updated",
      data: updatedUser,
      errors: null
    }

  }

  @MessagePattern({ cmd: 'auth_verify_user' })
  async verifyUser(verifyUserDTO: VerifyUserDTO): Promise<IVerifyUserResponse> {

    const user = await this.authService.decodeToken(verifyUserDTO.token);

    if (user == null) {
      return {
        status: HttpStatus.UNAUTHORIZED,
        message: "Not Authentcated",
        data: null,
        errors: { user: { path: "auth", message: "Not Authenticated" } }
      }
    }

    return {
      status: HttpStatus.OK,
      message: "User Verified",
      data: user,
      errors: null
    }

  }

  @MessagePattern({ cmd: 'auth_verify_roles' })
  async verifyRoles(verifyRoleDTO: VerifyRoleDTO): Promise<IVerifyUserResponse> {
    const user = await this.authService.decodeToken(verifyRoleDTO.token);

    if (!user) {
      return {
        status: HttpStatus.UNAUTHORIZED,
        message: "Not Authentcated",
        data: null,
        errors: { auth: { path: "auth", message: "Not Authenticated" } }
      }
    }

    const meetAllRoles = verifyRoleDTO.roles.every((role) =>
      user.roles.includes(role),
    );

    if (!meetAllRoles) {
      return {
        status: HttpStatus.FORBIDDEN,
        message: "User Is Forbidden",
        data: null,
        errors: { auth: { path: "auth", message: "Forbidden" } }
      }
    }

    return {
      status: HttpStatus.OK,
      message: "User Verified",
      data: user,
      errors: null
    }
  }

  @MessagePattern({ cmd: 'auth_make_user_admin' })
  async makeUserAdmin(userId: mongoose.Types.ObjectId): Promise<IMakeUserAdmin> {
    const updatedUser = await this.authService.makeUserAdmin(userId);

    if (!updatedUser) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: "User Not Found",
        data: null,
        errors: {
          user: { path: "user", message: "User Not Found" }
        }
      }
    }

    return {
      status: HttpStatus.OK,
      message: "User Updated",
      data: updatedUser,
      errors: null
    }
  }

  @EventPattern({ cmd: "restaurant_created" })
  async restaurantCreatedHandler(userIdDTO: UserIdDTO): Promise<IUpdateUserResponse> {
    const { id } = userIdDTO;
    const updatedRestaurant = await this.authService.giveRoleToUser(id, Role.RestaurantOwner);
    return {
      status: HttpStatus.OK,
      message: "Restaurant Role Has Given To User",
      data: updatedRestaurant,
      errors: null
    }
  }
}
