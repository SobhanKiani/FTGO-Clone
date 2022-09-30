import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CartResolver } from './resolvers/cart.resolver';
import { DateScalar } from './utils/custom-date';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'CART_SERVICE',
                transport: Transport.TCP,
                options: {
                    host: process.env.CART_HOST,
                    port: Number(process.env.CART_PORT),
                },
            },
        ]),
    ],
    providers: [
        DateScalar,
        CartResolver
    ]

})
export class CartModule { }
