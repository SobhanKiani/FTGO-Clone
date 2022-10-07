import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { prismaServiceMock } from '../../../test/mocks/prisma-service.mock';
import { PrismaService } from '../prisma-service/prisma-service.service';
import { CartService } from './cart.service';

describe('CartService', () => {
  let service: CartService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  it('should return cart for a giver user id', async () => {
    const upsertFunc = jest.spyOn(prismaService.cart, 'upsert');

    const userId = '5';
    const data = {
      user: {
        connect: {
          id: userId,
        },
      },
    };
    const cart = await service.getCartOrCreate(data);
    expect(cart).toBeDefined();
    expect(cart.userId).toEqual(userId);
    expect(upsertFunc).toHaveBeenCalled();
    expect(upsertFunc).toHaveBeenCalledWith({
      where: { userId },
      create: {
        user: {
          connect: {
            id: userId,
          },
        },
      },
      update: {},
      include: {
        CartFood: {
          include: {
            food: true,
          },
        },
      },
    });
  });

  it('should return cart if the cart already exists', async () => {
    const upsertFunc = jest.spyOn(prismaService.cart, 'upsert');

    const userId = '1';
    const data = {
      user: {
        connect: {
          id: userId,
        },
      },
    };
    const cart = await service.getCartOrCreate(data);
    expect(cart).toBeDefined();
    expect(cart.userId).toEqual(userId);
    expect(upsertFunc).toHaveBeenCalledWith({
      where: { userId },
      create: {
        user: {
          connect: {
            id: userId,
          },
        },
      },
      update: {},
      // include: { CartFood: true }
      include: {
        CartFood: {
          include: {
            food: true,
          },
        },
      },
    });
  });

  it('should delete cart if it exists', async () => {
    const deleteFunc = jest.spyOn(prismaService.cart, 'delete');

    const userId = '1';
    const args: Prisma.CartDeleteArgs = {
      where: { userId },
      include: {
        CartFood: {
          include: {
            food: true,
          },
        },
      },
    };
    const cart = await service.deleteCart(args);
    expect(cart.userId).toEqual(userId);
    expect(deleteFunc).toHaveBeenCalled();
    expect(deleteFunc).toHaveBeenCalledWith(args);
  });

  it('should update carts total price', async () => {
    const updateFunc = jest.spyOn(prismaService.cart, 'update');
    const findUniqueFunc = jest.spyOn(prismaService.cart, 'findUnique');

    const cartId = 10;
    const cart = await service.updateTotalPriceByCartId(cartId);
    expect(cart.totalPrice).toEqual(10);

    expect(findUniqueFunc).toHaveBeenCalled();
    expect(findUniqueFunc).toHaveBeenCalledWith({
      where: { id: cartId },
      include: { CartFood: { include: { food: true } } },
    });

    expect(updateFunc).toHaveBeenCalled();
    expect(updateFunc).toHaveBeenCalledWith({
      where: { id: cartId },
      data: { totalPrice: 10 },
    });
  });
});
