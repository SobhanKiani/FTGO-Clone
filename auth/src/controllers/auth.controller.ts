import mongoose from 'mongoose';
import { Controller, HttpStatus, Inject } from '@nestjs/common';
import {
  ClientProxy,
  EventPattern,
  MessagePattern,
} from '@nestjs/microservices';
import { AuthService } from '../services/auth.service';
import { LoginDTO } from '../dto/login.dto';
import { SignUpDTO } from '../dto/signUp.dto';
import { UserUpdateDTO } from '../dto/user-update.dto';
import { VerifyUserDTO } from '../dto/verifyUser.dto';
import { VerifyRoleDTO } from '../dto/verifyRole.dto';
import { ISignUpResponse } from '../interfaces/sign-up-response.interface';
import { ILoginResponse } from '../interfaces/login-response.interface';
import { IUpdateUserResponse } from '../interfaces/user-update-response.interface';
import { IMakeUserAdmin } from '../interfaces/make-user-admin-response.interface';
import { IVerifyUserResponse } from '../interfaces/verify-user-response.interface';
import { Role } from '../enums/roles.enum';
import { IUserCreatedEvent } from '../interfaces/events/user-created.event';
import { IUpdateUserEvent } from '../interfaces/events/user-updated.event';
import { ICreateRestaurantEvent } from '../interfaces/events/restaurant-created.event';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @Inject('NATS_SERVICE') private natsClient: ClientProxy,
  ) { }

  @MessagePattern({ cmd: 'auth_check' })
  async check(): Promise<{ Check_Status: string }> {
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
          message: 'Email Address Already Exists',
          data: null,
          errors: {
            email: { path: 'user', message: 'Email Address Already Exists' },
          },
        };
      }

      const newUser = await this.authService.createUser(signUpDTO);

      const eventData: IUserCreatedEvent = {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phoneNumber: newUser.phoneNumber,
        roles: newUser.roles,
        address: newUser.address,
      };

      this.natsClient.emit<any, IUserCreatedEvent>(
        { cmd: 'user_created' },
        eventData,
      );
      const token = await this.authService.createToken(newUser);
      const result = {
        token,
        user: newUser,
      };

      return {
        status: HttpStatus.CREATED,
        message: 'User Created',
        data: result,
        errors: null,
      };
    } catch (e) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Could Complete SignUp Request',
        data: null,
        errors: e.errors,
      };
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
        errors: {
          user: { path: 'user', message: 'Email Or Password Is Not Correct' },
        },
      };
    }

    const isPasswordValid = await user.isPasswordValid(loginDTO.password);

    if (!isPasswordValid) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Could Not Login With These Credentials',
        data: null,
        errors: {
          user: { path: 'user', message: 'Email Or Password Is Not Correct' },
        },
      };
    }

    const token = await this.authService.createToken(user);
    const result = {
      user,
      token,
    };

    return {
      status: HttpStatus.OK,
      message: 'User Logged In',
      data: result,
      errors: null,
    };
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
        message: 'User Not Found',
        data: null,
        errors: { user: { path: 'user', message: 'User Not Found' } },
      };
    }

    const eventData: IUpdateUserEvent = {
      id: updatedUser.id,
      data: {
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phoneNumber: updatedUser.phoneNumber,
        roles: updatedUser.roles,
        address: updatedUser.address,
      },
    };
    this.natsClient.emit<any, { id: string; data: IUpdateUserEvent }>(
      { cmd: 'user_updated' },
      { id: updatedUser.id, data: eventData },
    );

    return {
      status: HttpStatus.OK,
      message: 'User Updated',
      data: updatedUser,
      errors: null,
    };
  }

  @MessagePattern({ cmd: 'auth_verify_user' })
  async verifyUser(verifyUserDTO: VerifyUserDTO): Promise<IVerifyUserResponse> {
    const user = await this.authService.decodeToken(verifyUserDTO.token);

    if (user == null) {
      return {
        status: HttpStatus.UNAUTHORIZED,
        message: 'Not Authentcated',
        data: null,
        errors: { user: { path: 'auth', message: 'Not Authenticated' } },
      };
    }

    return {
      status: HttpStatus.OK,
      message: 'User Verified',
      data: user,
      errors: null,
    };
  }

  @MessagePattern({ cmd: 'auth_verify_roles' })
  async verifyRoles(
    verifyRoleDTO: VerifyRoleDTO,
  ): Promise<IVerifyUserResponse> {
    const user = await this.authService.decodeToken(verifyRoleDTO.token);

    if (!user) {
      return {
        status: HttpStatus.UNAUTHORIZED,
        message: 'Not Authentcated',
        data: null,
        errors: { auth: { path: 'auth', message: 'Not Authenticated' } },
      };
    }

    const meetAllRoles = verifyRoleDTO.roles.every((role) =>
      user.roles.includes(role),
    );

    if (!meetAllRoles) {
      return {
        status: HttpStatus.FORBIDDEN,
        message: 'User Is Forbidden',
        data: null,
        errors: { auth: { path: 'auth', message: 'Forbidden' } },
      };
    }

    return {
      status: HttpStatus.OK,
      message: 'User Verified',
      data: user,
      errors: null,
    };
  }

  @MessagePattern({ cmd: 'auth_make_user_admin' })
  async makeUserAdmin(
    params: { userId: mongoose.Types.ObjectId, }
  ): Promise<IMakeUserAdmin> {
    const { userId } = params;
    const updatedUser = await this.authService.makeUserAdmin(userId);

    if (!updatedUser) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'User Not Found',
        data: null,
        errors: {
          user: { path: 'user', message: 'User Not Found' },
        },
      };
    }

    return {
      status: HttpStatus.OK,
      message: 'User Updated',
      data: updatedUser,
      errors: null,
    };
  }

  @EventPattern({ cmd: 'restaurant_created' })
  async restaurantCreatedHandler(
    data: ICreateRestaurantEvent,
  ): Promise<IUpdateUserResponse> {
    try {
      const { ownerId: id } = data;
      const userId = new mongoose.Types.ObjectId(id);
      const updatedRestaurant = await this.authService.giveRoleToUser(
        userId,
        Role.RestaurantOwner,
      );
      return {
        status: HttpStatus.OK,
        message: 'Restaurant Role Has Given To User',
        data: updatedRestaurant,
        errors: null,
      };
    } catch (e) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Error Happend',
        data: null,
        errors: e,
      };
    }
  }
}
