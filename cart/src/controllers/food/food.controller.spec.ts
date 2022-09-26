import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { create } from 'domain';
import { async } from 'rxjs';
import { ICreateFoodEvent } from 'src/interfaces/events/create-food.event';
import { FoodService } from '../../services/food/food.service';
import { PrismaService } from '../../services/prisma-service/prisma-service.service';
import { prismaServiceMock } from '../../test/mocks/prisma-service.mock';
import { FoodController } from './food.controller';

describe('FoodController', () => {
  let controller: FoodController;
  let service: FoodService;
  const createData: ICreateFoodEvent = {
    id: 6,
    name: "food4",
    category: "cat3",
    isAvailable: true,
    price: 10
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoodController],
      providers: [
        FoodService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock
        }
      ]
    }).compile();

    controller = module.get<FoodController>(FoodController);
    service = module.get<FoodService>(FoodService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('should create food', async () => {
    const { status, data } = await controller.createFood(createData);
    expect(status).toEqual(HttpStatus.CREATED);
    expect(data).not.toBeNull();
  });
  
});
