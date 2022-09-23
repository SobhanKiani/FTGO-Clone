import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { async } from 'rxjs';
import { PrismaService } from '../../services/prisma-service/prisma-service.service';
import { UserService } from '../../services/user/user.service';
import { userServiceMock } from '../../test/mocks/user-service.mock';
import { UserController } from './user.controller';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: userServiceMock
        }
      ]
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('should create user', async () => {
    const createData: Prisma.UserCreateInput = {
      firstName: "Skn",
      lastName: "1942",
      id: '4'
    };

    const { status, data } = await controller.createUserForCart(createData);
    expect(status).toEqual(HttpStatus.CREATED);
    expect(data.firstName).toEqual(createData.firstName);
    expect(data.id).toEqual(createData.id);
  });

  it('should not create user if id already exists', async () => {
    const createData: Prisma.UserCreateInput = {
      firstName: "Skn",
      lastName: "1942",
      id: '1'
    };

    const { status, data } = await controller.createUserForCart(createData);
    expect(status).toEqual(HttpStatus.BAD_REQUEST);
    expect(data).toBeNull();
  });

  it('should update user', async () => {
    const { status, data } = await controller.updateUserForCart({ id: '1', data: { firstName: "new name" } });
    expect(status).toEqual(HttpStatus.OK);
    expect(data.firstName).toEqual('new name');
  });

  it('should not update id user does not exist', async () => {
    const { status, data } = await controller.updateUserForCart({ id: '-1', data: { firstName: "new name" } });
    expect(status).toEqual(HttpStatus.NOT_FOUND)
    expect(data).toBeNull();
  })

});
