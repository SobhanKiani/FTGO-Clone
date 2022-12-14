import { Controller, HttpStatus, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { Prisma } from '@prisma/client';
import { ICreateOrderResponse } from 'src/interfaces/order/create-order-response.interface';
import { ICreateOrdereEvent } from '../../interfaces/events/create-order-event.event';
import { OrderService } from '../../services/order/order.service';

@Controller('order')
export class OrderController {

    constructor(
        private orderService: OrderService,
        @Inject('NATS_SERVICE') private natsClient: ClientProxy,
    ) { }

    @MessagePattern({ cmd: "create_order" })
    async createOrder(data: Prisma.OrderCreateInput): Promise<ICreateOrderResponse> {
        try {
            const order = await this.orderService.createOrder(data);
            if (!order) {
                return {
                    status: HttpStatus.BAD_REQUEST,
                    message: "Order Did Not Created",
                    data: null,
                    errors: { order: { path: "order", message: "could not create order" } }
                }
            }
            const eventData: ICreateOrdereEvent = {
                id: order.id,
                userId: order.userId,
                cartId: order.cartId,
                price: order.price,
            }
            this.natsClient.emit<any, ICreateOrdereEvent>({ cmd: "order_created" }, eventData);

            return {
                status: HttpStatus.CREATED,
                message: "Order Created",
                data: order,
                errors: null
            }

        } catch (e) {
            console.log(e);
            return {
                status: HttpStatus.BAD_REQUEST,
                message: "Could Not Create The Order",
                data: null,
                errors: e
            }
        }
    }
}
