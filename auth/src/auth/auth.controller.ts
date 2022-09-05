import { Controller, HttpStatus, Inject, NotFoundException, Param } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { SignUpDTO } from './dto/signUp.dto';
import { UserUpdateDTO } from './dto/user-update.dto';
import { VerifyUserDTO } from './dto/verifyUser.dto';
import { VerifyRoleDTO } from './dto/verifyRole.dto';
import { User } from './models/user.model';
import { NotAuthorizedException } from './utils/NotAuthorizedException';
import mongoose from 'mongoose';
import { ISignUpResponse } from './interfaces/sign-up-response.interface';
import { ILoginResponse } from './interfaces/login-response.interface';
import { IUpdateUserResponse } from './interfaces/user-update-response.interface';
import { IMakeUserAdmin } from './interfaces/make-user-admin-response.interface';
import { IVerifyUserResponse } from './interfaces/verify-user-response.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) { }

  @MessagePattern({ cmd: 'auth_check' })
  async check(data: {}): Promise<{ Check_Status: string }> {
    return {
      Check_Status: 'NestJS Auth Is Working, Hello',
    };
  }

  @MessagePattern({ cmd: 'auth_sign_up' })
  async signUp(signUpDTO: SignUpDTO): Promise<ISignUpResponse> {
    const result = await this.authService.signUp(signUpDTO);
    if ('errors' in result) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: "User Could Not Be Created",
        data: null,
        errors: result.errors
      }
    } else if ('token' in result) {
      return {
        status: HttpStatus.CREATED,
        message: 'User Created',
        data: result,
        errors: null

      }
    }
  }

  @MessagePattern({ cmd: 'auth_login' })
  async login(loginDTO: LoginDTO): Promise<ILoginResponse> {
    const result = await this.authService.login(loginDTO);
    if ('errors' in result) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: "User Could Not Be Created",
        data: null,
        errors: result.errors
      }
    }

    if ('token' in result) {
      return {
        status: HttpStatus.OK,
        message: 'User Logged In',
        data: result,
        errors: null
      }
    }
  }

  @MessagePattern({ cmd: 'auth_update_user' })
  async updateUser(userUpdateInfo: {
    userUpdateDTO: UserUpdateDTO;
    userId: mongoose.Types.ObjectId;
  }): Promise<IUpdateUserResponse> {
    const result = await this.authService.updateUser(
      userUpdateInfo.userId,
      userUpdateInfo.userUpdateDTO,
    );

    if ('errors' in result) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: "Could Not Update User",
        data: null,
        errors: result.errors
      }
    }

    if ('email' in result) {
      return {
        status: HttpStatus.OK,
        message: "User Updated",
        data: result,
        errors: null
      }
    }
  }

  @MessagePattern({ cmd: 'auth_verify_user' })
  async verifyUser(verifyUserDTO: VerifyUserDTO): Promise<IVerifyUserResponse> {
    const result = await this.authService.decodeToken(verifyUserDTO.token);
    if ('errors' in result) {
      return {
        status: HttpStatus.UNAUTHORIZED,
        message: "Not Authentcated",
        data: null,
        errors: result.errors
      }
    }
    return {
      status: HttpStatus.OK,
      message: "User Verified",
      data: result,
      errors: null
    }
  }

  @MessagePattern({ cmd: 'auth_verify_roles' })
  async verifyRoles(verifyRoleDTO: VerifyRoleDTO): Promise<IVerifyUserResponse> {
    const result = await this.authService.decodeToken(verifyRoleDTO.token);
    if ('errors' in result) {
      return {
        status: HttpStatus.UNAUTHORIZED,
        message: "Not Authenticated",
        data: null,
        errors: result.errors
      }
    }

    const meetAllRoles = verifyRoleDTO.roles.every((role) =>
      result.roles.includes(role),
    );

    if (!meetAllRoles) {
      return {
        status: HttpStatus.FORBIDDEN,
        message: "User Is Forbidden",
        data: result,
        errors: null
      }
    }

    return {
      status: HttpStatus.OK,
      message: "User Verified",
      data: result,
      errors: null
    }
  }

  @MessagePattern({ cmd: 'auth_make_user_admin' })
  async makeUserAdmin(userId: mongoose.Types.ObjectId): Promise<IMakeUserAdmin> {
    const result = await this.authService.makeUserAdmin(userId);

    if ('errors' in result) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: "Could Not Make User Admin",
        data: null,
        errors: result.errors
      }
    }

    if ('email' in result) {
      return {
        status: HttpStatus.OK,
        message: "User Updated",
        data: result,
        errors: null
      }
    }
  }
}
