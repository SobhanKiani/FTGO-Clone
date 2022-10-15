import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { clientProxyMock } from '../../../test/mocks/client-proxy.mock';
import { orderData, prismaServiceMock } from '../../../test/mocks/prisma-service-mock';
import { PrismaService } from '../prisma-service/prisma-service.service';
import { OrderService } from './order.service';

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock
        },
        {
          provide: ClientProxy,
          useValue: clientProxyMock
        }
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create order with correct data', async () => {
    const data: Prisma.OrderCreateInput = orderData

    const newOrder = await service.createOrder(data);
    expect(newOrder.price).toEqual(data.price);
    expect(newOrder.foods.length).toBeGreaterThan(0)
  })

});
