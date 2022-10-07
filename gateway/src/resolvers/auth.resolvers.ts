import { HttpException, HttpStatus, Inject, UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { LoginInput } from 'src/inputs/auth/login.input';
import { UpdateUserInput } from 'src/inputs/auth/updateUser.input';
import { ILoginResponse } from 'src/interfaces/auth/login-response.interface';
import { IMakeUserAdmin } from 'src/interfaces/auth/make-user-admin-response.interface';
import { ISignUpResponse } from 'src/interfaces/auth/sign-up-response.interface';
import { AuthData } from 'src/models/auth/AuthData.model';
import { CheckStatus } from 'src/models/auth/checkStatus.model';
import { User } from 'src/models/auth/user.model';
import { UserIdArg } from '../args/auth/userId.args';
import { GetUser } from '../decorators/get-user-from-request.decorator';
import { IsPrivate } from '../decorators/is-private.decorator';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/roles.enum';
import { RolesGuard } from '../guards/roles.guard';
import { CreateUserInput } from '../inputs/auth/createUser.input';

Resolver((of) => User);
export class AuthResolver {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) { }

  @Query((returns) => CheckStatus)
  async checkAuthClientStatus() {
    const pattern = { cmd: 'auth_check' };
    const result = await this.authClient.send(pattern, undefined);

    return result;
  }

  @Mutation((returns) => AuthData)
  async signUp(@Args('createUserData') createUserData: CreateUserInput) {
    const result = await firstValueFrom(
      this.authClient.send<ISignUpResponse>(
        { cmd: 'auth_sign_up' },
        createUserData,
      ),
    );

    if (result.status !== HttpStatus.CREATED) {
      throw new HttpException(
        { message: result.message, errors: result.errors },
        result.status,
      );
    }

    return result.data;
  }

  @Mutation((returns) => AuthData)
  async login(@Args('loginData') loginData: LoginInput) {
    const result = await firstValueFrom(
      this.authClient.send<ILoginResponse>({ cmd: 'auth_login' }, loginData),
    );
    if (result.status !== HttpStatus.OK) {
      throw new HttpException(
        { message: result.message, errors: result.errors },
        result.status,
      );
    }
    return result.data;
  }

  @Mutation((returns) => User)
  @IsPrivate(true)
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  async makeUserAdmin(@Args() userId: UserIdArg) {
    const result = await firstValueFrom(
      this.authClient.send<IMakeUserAdmin>(
        { cmd: 'auth_make_user_admin' },
        userId.id,
      ),
    );
    if (result.status !== HttpStatus.OK) {
      throw new HttpException(
        { message: 'Could Not Update User To Admin', errors: result.errors },
        result.status,
      );
    }

    return result.data;
  }

  @Mutation((returns) => User)
  @IsPrivate(true)
  async updateUser(
    @Args('updateUserData') updateUserData: UpdateUserInput,
    @GetUser() user: User,
  ) {
    const result = await firstValueFrom(
      await this.authClient.send(
        { cmd: 'auth_update_user' },
        {
          userUpdateDTO: updateUserData,
          userId: user.id,
        },
      ),
    );

    if (result.status !== HttpStatus.OK) {
      throw new HttpException(
        { message: 'Could Not Update User', errors: result.errors },
        result.status,
      );
    }

    return result.data;
  }
}
