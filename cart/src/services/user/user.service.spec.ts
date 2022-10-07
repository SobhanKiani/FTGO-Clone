import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import {
  fakeUsers,
  prismaServiceMock,
} from '../../../test/mocks/prisma-service.mock';
import { PrismaService } from '../prisma-service/prisma-service.service';
import { UserService } from './user.service';

describe('UserService', () => {
  let userService: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
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
    const findUniqueFunc = jest.spyOn(prisma.user, 'findUnique');

    const query = { id: '1' };
    const user = await userService.getUserByUniqueInfo(query);
    expect(user.firstName).toEqual(fakeUsers[0].firstName);
    expect(findUniqueFunc).toHaveBeenCalled();
    expect(findUniqueFunc).toHaveBeenCalledWith({
      where: query,
      include: { cart: true },
    });
  });

  it('should retur null if user does not exists ', async () => {
    const findUniqueFunc = jest.spyOn(prisma.user, 'findUnique');

    const query = { id: '-1' };
    const user = await userService.getUserByUniqueInfo(query);
    expect(user).toBeNull();
    expect(findUniqueFunc).toHaveBeenCalled();
    expect(findUniqueFunc).toHaveBeenCalledWith({
      where: query,
      include: { cart: true },
    });
  });

  it('should create user with correct data', async () => {
    const createFunc = jest.spyOn(prisma.user, 'create');

    const data: Prisma.UserCreateInput = {
      firstName: 'Skn',
      lastName: '1942',
      id: '4',
    };
    const newUser = await userService.createUser(data);
    expect(newUser.firstName).toBe(data.firstName);
    expect(createFunc).toHaveBeenCalled();
    expect(createFunc).toHaveBeenCalledWith({ data });
  });

  it('should update user', async () => {
    const updateFunc = jest.spyOn(prisma.user, 'update');

    const user = await userService.updateUser(
      { id: '1' },
      { firstName: 'new name' },
    );
    expect(user.firstName).toEqual('new name');
    expect(updateFunc).toHaveBeenCalled();
    expect(updateFunc).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { firstName: 'new name' },
    });
  });
});
