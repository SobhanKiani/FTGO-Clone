import { Inject, UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ClientProxy } from '@nestjs/microservices';
import { UserIdArg } from '../args/userId.args';
import { GetUser } from '../decorators/get-user-from-request.decorator';
import { IsPrivate } from '../decorators/isPrivate.decorator';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/roles.enum';
import { RolesGuard } from '../guards/roles.guard';
import { CreateUserInput } from '../inputs/createUser.input';
import { LoginInput } from '../inputs/login.input';
import { UpdateUserInput } from '../inputs/updateUser.input';
import { AuthData } from '../models/AuthData.model';
import { CheckStatus } from '../models/checkStatus.model';
import { User } from '../models/user.model';

Resolver((of) => User);
export class AuthResolver {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

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
    return await this.authClient.send({ cmd: 'auth_sign_up' }, createUserData);
  }

  @Mutation((returns) => AuthData)
  async login(@Args('loginData') loginData: LoginInput) {
    return await this.authClient.send({ cmd: 'auth_login' }, loginData);
  }

  @Mutation((returns) => User)
  // @IsPrivate(true)
  // @Roles(Role.Admin)
  // @UseGuards(RolesGuard)
  async makeUserAdmin(@Args() userId: UserIdArg) {
    return await this.authClient.send({ cmd: 'auth_make_user_admin' }, userId.id);
  }

  @Mutation((returns) => User)
  @IsPrivate(true)
  async updateUser(
    @Args('updateUserData') updateUserData: UpdateUserInput,
    @GetUser() user: User,
  ) {
    return await this.authClient.send(
      { cmd: 'auth_update_user' },
      {
        userUpdateDTO: updateUserData,
        userId: user.id,
      },
    );
  }
}
