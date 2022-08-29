import {
  Controller,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { GetUser } from './decorators/get-user-from-request.decorator';
import { LoginDTO } from './dto&params/login.dto';
import { SignUpDTO } from './dto&params/signUp.dto';
import { UserIdParam } from './dto&params/user-detail.param';
import { UserUpdateDTO } from './dto&params/user-update.dto';
import { VerifyUserDTO } from './dto&params/verifyUser.dto';
import { VerifyRoleDTO } from './dto&params/verifyRole.dto'
import { User } from './models/user.model';
import { NotAuthorizedException } from './utils/NotAuthorizedException';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @MessagePattern({ cmd: "AUTH_check" })
  check() {
    return {
      Check_Status: 'NestJS Auth Is Working, Hello',
    };
  }

  @MessagePattern({ cmd: "AUTH_signUp" })
  async signUp(
    signUpDTO: SignUpDTO,
  ): Promise<{ user: User; token: string }> {
    return await this.authService.signUp(signUpDTO);
  }

  @MessagePattern({ cmd: "AUTH_login" })
  async login(
    loginDTO: LoginDTO,
  ): Promise<{ user: User; token: string }> {
    return await this.authService.login(loginDTO);
  }

  @MessagePattern({ cmd: "AUTH_updateUser" })
  async updateUser(
    userUpdateDTO: UserUpdateDTO,
    @GetUser() user: User,
  ) {
    return await this.authService.updateUser(user.id, userUpdateDTO);
  }

  @MessagePattern({ cmd: "AUTH_verifyUser" })
  async verifyUser(verifyUserDTO: VerifyUserDTO): Promise<User> {
    return await this.authService.decodeToken(verifyUserDTO.token);
  }

  @MessagePattern({ cmd: "AUTH_verifyAdmin" })
  async verifyRoles(verifyRoleDTO: VerifyRoleDTO): Promise<User> {
    const user = await this.authService.decodeToken(verifyRoleDTO.token);
    const meetAllRoles = verifyRoleDTO.roles.every((role) => user.roles.includes(role))
    if (!meetAllRoles) {
      throw new NotAuthorizedException('User Does Not Have All The Roles');
    }
    return user;
  }

  @MessagePattern({ cmd: "AUTH_makeUserAdmin" })
  async makeUserAdmin(@Param() params: UserIdParam) {
    return await this.authService.makeUserAdmin(params.id);
  }
}
// @Controller('auth')
// export class AuthController {
//   constructor(private authService: AuthService) {}

//   @Get('/check')
//   check() {
//     return {
//       Check_Status: 'NestJS Auth Is Working',
//     };
//   }

//   @Post('/signUp')
//   async signUp(
//     @Body() signUpDTO: SignUpDTO,
//   ): Promise<{ user: User; token: string }> {
//     return await this.authService.signUp(signUpDTO);
//   }

//   @Post('/login')
//   async login(
//     @Body() loginDTO: LoginDTO,
//   ): Promise<{ user: User; token: string }> {
//     return await this.authService.login(loginDTO);
//   }

//   @Put('/')
//   @UseGuards(JwtAuthGuard)
//   async updateUser(
//     @Body() userUpdateDTO: UserUpdateDTO,
//     @GetUser() user: User,
//   ) {
//     return await this.authService.updateUser(user.id, userUpdateDTO);
//   }

//   @Post('/verify-user')
//   @UseGuards(JwtAuthGuard)
//   async verifyUser(@GetUser() user: User): Promise<User> {
//     return user;
//   }

//   @Post('/verify-admin')
//   @Roles(Role.Admin)
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   async verifyAdmin(@GetUser() user: User): Promise<User> {
//     return user;
//   }

//   @Post('/:id/make-admin')
//   // @Roles(Role.Admin)
//   // @UseGuards(JwtAuthGuard, RolesGuard)
//   async makeUserAdmin(@Param() params: UserIdParam) {
//     return await this.authService.makeUserAdmin(params.id);
//   }
// }
