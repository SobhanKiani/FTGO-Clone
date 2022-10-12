import { HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { OrderService } from '../../services/order/order.service';
import { PrismaService } from '../../services/prisma-service/prisma-service.service';
import { clientProxyMock } from '../../../test/mocks/client-proxy.mock';
import { prismaServiceMock } from '../../../test/mocks/prisma-service-mock';
import { OrderController } from './order.controller';

describe('OrderController', () => {
  let controller: OrderController;
  let natsClient: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        OrderService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock
        },
        {
          provide: 'NATS_SERVICE',
          useValue: clientProxyMock
        }
      ]
    }).compile();

    controller = module.get<OrderController>(OrderController);
    natsClient = module.get<ClientProxy>("NATS_SERVICE")
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(natsClient).toBeDefined();
  });

  it('should create order', async () => {
    const emitFunc = jest.spyOn(natsClient, 'emit');
    const createData: Prisma.OrderCreateInput = {
      price: 20.0,
      cartId: 1,
      address: "Test Addr",
      userId: '1'
    };

    const { data, status } = await controller.createOrder(createData);
    expect(status).toEqual(HttpStatus.CREATED);
    expect(data.price).toEqual(createData.price);

    expect(emitFunc).toHaveBeenCalled();
    expect(emitFunc).toHaveBeenCalledWith({ cmd: "create_order" }, { ...data });

  })
});
