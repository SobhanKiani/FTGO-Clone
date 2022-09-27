import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { CartFoodService } from '../../services/cart-food/cart-food.service';
import { PrismaService } from '../../services/prisma-service/prisma-service.service';
import { UserService } from '../../services/user/user.service';
import { prismaServiceMock } from '../../test/mocks/prisma-service.mock';
import { CartFoodController } from './cart-food.controller';

describe('CartFoodController', () => {
  let controller: CartFoodController;
  let service: CartFoodService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartFoodController],
      providers: [
        CartFoodService,
        UserService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock
        }
      ]
    }).compile();

    controller = module.get<CartFoodController>(CartFoodController);
    service = module.get<CartFoodService>(CartFoodService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('should add food to cart', async () => {
    const createData = {
      userId: "1",
      cartId: 10,
      foodId: 10,
      count: 1
    }

    const { status, data } = await controller.addOrUpdateFood(createData);
    expect(status).toEqual(HttpStatus.OK);
    expect(data.count).toEqual(createData.count);
  });

  it('should update existing food in cart', async () => {
    const updateData = {
      userId: "1",
      cartId: 10,
      foodId: 5,
      count: 2
    };

    const { status, data } = await controller.addOrUpdateFood(updateData);
    expect(status).toEqual(HttpStatus.OK);
    expect(data.count).toEqual(updateData.count);
  });

  it('should not update another ones cart', async () => {
    const updateData = {
      userId: "2",
      cartId: 10,
      foodId: 5,
      count: 2
    };

    const { status, data } = await controller.addOrUpdateFood(updateData);
    expect(status).toEqual(HttpStatus.FORBIDDEN);
    expect(data).toBeNull();
  })



});
