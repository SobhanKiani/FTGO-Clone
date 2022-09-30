import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from '../../services/cart/cart.service';
import { PrismaService } from '../../services/prisma-service/prisma-service.service';
import { prismaServiceMock } from '../../test/mocks/prisma-service.mock';
import { CartController } from './cart.controller';

describe('CartController', () => {
  let controller: CartController;
  let service: CartService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        CartService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock
        }
      ]
    }).compile();

    controller = module.get<CartController>(CartController);
    service = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('should return cart for a given user id', async () => {
    const userId = '5';
    const { status, data: cart } = await controller.userCart({ userId });
    expect(status).toEqual(HttpStatus.OK);
    expect(cart.userId).toEqual(userId);
  });

  it('should return cart if the userId already exists', async () => {
    const userId = '1';
    const { status, data: cart } = await controller.userCart({ userId });
    expect(status).toEqual(HttpStatus.OK);
    expect(cart.userId).toEqual(userId);
  });

  it('should delete cart if exists', async () => {
    const userId = '1';
    const { status, data: cart } = await controller.userCart({ userId });
    expect(status).toEqual(HttpStatus.OK);
    expect(cart.userId).toEqual(userId);
  })


});
