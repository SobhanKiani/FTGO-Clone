import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma-service/prisma-service.service';
import { User, Prisma, Cart } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserByUniqueInfo(
    where: Prisma.UserWhereUniqueInput,
  ): Promise<User & { cart: Cart }> {
    return await this.prisma.user.findUnique({
      where,
      include: { cart: true },
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return await this.prisma.user.create({ data });
  }

  async updateUser(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput,
  ): Promise<User> {
    try {
      return await this.prisma.user.update({
        where,
        data,
      });
    } catch (e) {
      console.log(e);
    }
  }
}
