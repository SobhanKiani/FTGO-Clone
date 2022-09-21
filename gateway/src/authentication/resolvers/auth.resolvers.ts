import { BadRequestException, HttpException, HttpStatus, Inject, UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ClientProxy } from '@nestjs/microservices';
import { first, firstValueFrom } from 'rxjs';
import { NotAuthenticatedException } from 'src/utils/NotAuthenticatedException';
import { UserIdArg } from '../args/userId.args';
import { GetUser } from '../decorators/get-user-from-request.decorator';
import { IsPrivate } from '../decorators/is-private.decorator';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/roles.enum';
import { RolesGuard } from '../guards/roles.guard';
import { CreateUserInput } from '../inputs/createUser.input';
import { LoginInput } from '../inputs/login.input';
import { UpdateUserInput } from '../inputs/updateUser.input';
import { ILoginResponse } from '../interfaces/login-response.interface';
import { IMakeUserAdmin } from '../interfaces/make-user-admin-response.interface';
import { ISignUpResponse } from '../interfaces/sign-up-response.interface';
import { AuthData } from '../models/AuthData.model';
import { CheckStatus } from '../models/checkStatus.model';
import { User } from '../models/user.model';

Resolver((of) => User);
export class AuthResolver {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) { }

  @Query((returns) => CheckStatus)
  // @IsPrivate(true)
  // @Roles(Role.User)
  // @UseGuards(RolesGuard)
  async checkAuthClientStatus() {
    const pattern = { cmd: 'auth_check' };
    const result = await this.authClient.send(pattern, {});

    return result;
  }

  @Mutation((returns) => AuthData)
  async signUp(@Args('createUserData') createUserData: CreateUserInput) {
    const result = await firstValueFrom(this.authClient.send<ISignUpResponse>({ cmd: 'auth_sign_up' }, createUserData));

    if (result.status !== HttpStatus.CREATED) {
      throw new HttpException({ message: result.message, errors: result.errors }, result.status);
    }

    return result.data
  }

  @Mutation((returns) => AuthData)
  async login(@Args('loginData') loginData: LoginInput) {
    const result = await firstValueFrom(this.authClient.send<ILoginResponse>({ cmd: 'auth_login' }, loginData));
    if (result.status !== HttpStatus.OK) {
      throw new HttpException({ message: result.message, errors: result.errors }, result.status);
    }
    console.log(result.data);
    return result.data;
  }

  @Mutation((returns) => User)
  // @IsPrivate(true)
  // @Roles(Role.Admin)
  // @UseGuards(RolesGuard)
  async makeUserAdmin(@Args() userId: UserIdArg) {
    const result = await firstValueFrom(this.authClient.send<IMakeUserAdmin>({ cmd: 'auth_make_user_admin' }, userId.id));
    if (result.status !== HttpStatus.OK) {
      throw new HttpException({ message: "Could Not Update User To Admin", errors: result.errors }, result.status)
    }

    return result.data;
  }

  @Mutation((returns) => User)
  @IsPrivate(true)
  async updateUser(
    @Args('updateUserData') updateUserData: UpdateUserInput,
    @GetUser() user: User,
  ) {
    const result = await firstValueFrom(await this.authClient.send(
      { cmd: 'auth_update_user' },
      {
        userUpdateDTO: updateUserData,
        userId: user.id,
      },
    ));

    if (result.status !== HttpStatus.OK) {
      throw new HttpException({ message: "Could Not Update User", errors: result.errors }, result.status);
    }

    return result.data
  }
}
