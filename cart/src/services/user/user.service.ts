import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma-service/prisma-service.service';
import { User, Prisma } from '@prisma/client'


@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService
    ) { }

    async getUserByUniqueInfo(
        where: Prisma.UserWhereUniqueInput
    ) {
        return await this.prisma.user.findUnique({ where });
    }

    async createUser(
        data: Prisma.UserCreateInput
    ) {
        return await this.prisma.user.create({ data });
    }

    async updateUser(
        where: Prisma.UserWhereUniqueInput,
        data: Prisma.UserUpdateInput
    ) {
        return await this.prisma.user.update({
            where,
            data
        });
    }
}
