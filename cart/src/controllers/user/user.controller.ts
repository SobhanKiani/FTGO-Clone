import { Controller, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { Prisma } from '@prisma/client';
import { ICreateUserCart } from 'src/interfaces/create-user-cart-response.interface';
import { IUpdateUserCart } from 'src/interfaces/update-user-cart-response.interface';
import { UserService } from '../../services/user/user.service';

@Controller('user')
export class UserController {
    constructor(
        private userService: UserService
    ) { }

    // @UsePipes(new ValidationPipe())
    @EventPattern({ cmd: "user_created" })
    async createUserForCart(
        data: Prisma.UserCreateInput
    ): Promise<ICreateUserCart> {
        try {

            const foundUser = await this.userService.getUserByUniqueInfo({ id: data.id });
            if (foundUser) {
                return {
                    status: HttpStatus.BAD_REQUEST,
                    message: "User With This Id Already Exists",
                    data: null,
                    errors: { user_cart: { path: "user", message: "user already exists" } }
                }
            }

            const createData: Prisma.UserCreateInput = {
                firstName: data.firstName,
                lastName: data.lastName,
                id: data.id
            }
            const user = await this.userService.createUser(createData);
            if (!user) {
                return {
                    status: HttpStatus.BAD_REQUEST,
                    message: "Could Not Create User",
                    data: null,
                    errors: { user_cart: { path: "user", message: "could not create user" } }
                }
            }

            return {
                status: HttpStatus.CREATED,
                message: "User Created For Cart",
                data: user,
                errors: null
            }

        } catch (e) {
            return {
                status: HttpStatus.BAD_REQUEST,
                message: "Could Not Create User",
                data: null,
                errors: e
            }
        }
    }


    @EventPattern({ cmd: "user_updated" })
    async updateUserForCart(
        params: { id: string, data: Prisma.UserUpdateInput }
    ): Promise<IUpdateUserCart> {
        try {
            const { id, data } = params;
            const updateData: Prisma.UserUpdateInput = {
                firstName: data.firstName,
                lastName: data.lastName,
            }
            
            const user = await this.userService.updateUser({ id }, updateData);
            if (!user) {
                return {
                    status: HttpStatus.NOT_FOUND,
                    message: "User Not Found",
                    data: null,
                    errors: { user_cart: { path: "user", message: "could not create user" } }
                }
            }

            return {
                status: HttpStatus.OK,
                message: "User Updated",
                data: user,
                errors: null
            }

        } catch (e) {
            return {
                status: HttpStatus.BAD_REQUEST,
                message: "Could Not Update User",
                data: null,
                errors: e
            }
        }

    }
}
