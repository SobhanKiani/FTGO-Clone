import { Test, TestingModule } from '@nestjs/testing';
import { prismaServiceMock } from '../../test/mocks/prisma-service.mock';
import { PrismaService } from '../prisma-service/prisma-service.service';
import { FoodService } from './food.service';

describe('FoodService', () => {
  let service: FoodService;
  let prisma: PrismaService;
  const createData = {
    id: 6,
    name: "food4",
    category: "cat3",
    isAvailable: true,
    price: 10
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoodService,
        { provide: PrismaService, useValue: prismaServiceMock }
      ],
    }).compile();

    service = module.get<FoodService>(FoodService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
  });

  it('should create user', async () => {
    const createFunc = jest.spyOn(prisma.food, 'create');
    const food = service.createFood(createData);
    expect(food).toBeDefined();
    expect(createFunc).toHaveBeenCalled();
    expect(createFunc).toHaveBeenCalledWith({ data: createData });
  });

  it('should create user', async () => {
    const updateFunc = jest.spyOn(prisma.food, 'update');
    const updateData = {
      name: "new name"
    }
    const food = service.updateFood({ id: 5 }, updateData);
    expect(food).toBeDefined();
    expect(updateFunc).toHaveBeenCalled();
    expect(updateFunc).toHaveBeenCalledWith({ data: updateData, where: { id: 5 } });
  });

  it('should retur null if food does not exists', async () => {
    const updateFunc = jest.spyOn(prisma.food, 'update');
    const updateData = {
      name: "new name"
    }
    const food = service.updateFood({ id: -1 }, updateData);
    expect(food).toBeDefined();
    expect(updateFunc).toHaveBeenCalled();
    expect(updateFunc).toHaveBeenCalledWith({ data: updateData, where: { id: -1 } });
  })
});
