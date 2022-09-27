import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { prismaServiceMock } from '../../test/mocks/prisma-service.mock';
import { PrismaService } from '../prisma-service/prisma-service.service';
import { CartFoodService } from './cart-food.service';

describe('CartFoodService', () => {
  let service: CartFoodService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartFoodService,
        { provide: PrismaService, useValue: prismaServiceMock }
      ],
    }).compile();

    service = module.get<CartFoodService>(CartFoodService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
  });

  it('should create new cartFood if does not exists', async () => {
    const createFunc = jest.spyOn(prisma.cartFood, 'create');
    const updateFunc = jest.spyOn(prisma.cartFood, 'update');
    const findUniqueFunc = jest.spyOn(prisma.cartFood, 'findUnique');

    const createData: Prisma.CartFoodCreateInput = {
      cart: { connect: { id: 10 } },
      food: { connect: { id: 10 } },
      count: 1,
    }
    const cartId = createData.cart.connect.id;
    const foodId = createData.food.connect.id;
    const cartFood = await service.addOrUpdateCartByFood({
      ...createData
    });
    expect(cartFood.foodId).toEqual(foodId);
    expect(cartFood.cartId).toEqual(cartId);

    expect(findUniqueFunc).toHaveBeenCalled();
    expect(findUniqueFunc).toHaveBeenCalledWith({
      where: {
        foodInCart: {
          cartId,
          foodId
        }
      }
    });

    expect(createFunc).toHaveBeenCalled()
    expect(createFunc).toHaveBeenCalledWith({
      data: {
        count: createData.count,
        cart: createData.cart,
        food: createData.food
      }
    })

    expect(updateFunc).not.toHaveBeenCalledWith({
      where: {
        foodInCart: {
          cartId,
          foodId
        }
      },
      data: {
        count: createData.count,
      }
    });

  });

  it('should update cartFood if exists', async () => {
    const createFunc = jest.spyOn(prisma.cartFood, 'create');
    const updateFunc = jest.spyOn(prisma.cartFood, 'update');
    const findUniqueFunc = jest.spyOn(prisma.cartFood, 'findUnique');

    const createData: Prisma.CartFoodCreateInput = {
      cart: { connect: { id: 10 } },
      food: { connect: { id: 5 } },
      count: 2,
    }

    const cartId = createData.cart.connect.id;
    const foodId = createData.food.connect.id;
    const cartFood = await service.addOrUpdateCartByFood({
      ...createData
    });
    expect(cartFood.foodId).toEqual(foodId);
    expect(cartFood.cartId).toEqual(cartId);

    expect(findUniqueFunc).toHaveBeenCalled();
    expect(findUniqueFunc).toHaveBeenCalledWith({
      where: {
        foodInCart: {
          cartId,
          foodId
        }
      }
    });

    expect(updateFunc).toHaveBeenCalled()
    expect(updateFunc).toHaveBeenCalledWith({
      where: {
        foodInCart: {
          cartId,
          foodId
        }
      },
      data: {
        count: createData.count,
      }
    })

    expect(createFunc).not.toHaveBeenCalledWith({
      data: {
        count: createData.count,
        cart: createData.cart,
        food: createData.food
      }
    });
  });

});
