import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { async } from 'rxjs';
import { fakeUsers, userServiceMock } from '../../test/mocks/user-service.mock';
import { PrismaService } from '../prisma-service/prisma-service.service';
import { UserService } from './user.service';

describe('UserService', () => {
  let userService: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService, {
          provide: PrismaService, useValue: userServiceMock
        }
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('services should be defined', () => {
    expect(userService).toBeDefined();
    expect(prisma).toBeDefined();
  });

  it('should get user by id', async () => {
    const query = { id: 1 };
    const user = await userService.getUserByUniqueInfo(query);
    expect(user.firstName).toEqual(fakeUsers[0].firstName);
    expect(prisma.user.findUnique).toBeCalled();
    expect(prisma.user.findUnique).toBeCalledWith({ where: query });
  });

  it('should retur null if user does not exists ', async () => {
    const query = { id: -1 }
    const user = await userService.getUserByUniqueInfo(query);
    expect(user).toBeNull();
    expect(prisma.user.findUnique).toBeCalled()
    expect(prisma.user.findUnique).toBeCalledWith({ where: query });
  });

  it('should create user with correct data', async () => {
    const data: Prisma.UserCreateInput = {
      firstName: "Skn",
      lastName: "1942",
      id: 4
    }
    const newUser = await userService.createUser(data);
    expect(newUser.firstName).toBe(data.firstName);
    expect(prisma.user.create).toHaveBeenCalled();
    expect(prisma.user.create).toHaveBeenCalledWith({ data });
  });

  it('should update user', async () => {
    const user = await userService.updateUser({ id: 1 }, { firstName: "new name" });
    expect(user.firstName).toEqual('new name');
    expect(prisma.user.update).toHaveBeenCalled()
    expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { firstName: "new name" } });
  })
});
