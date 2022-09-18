import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { FoodResovler } from './resolvers/food.resovler';
import { RestaurantResolver } from './resolvers/restaurant.resolver';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'RESTAURANT_SERVICE',
                transport: Transport.TCP,
                options: {
                    host: process.env.RESTAURANT_HOST,
                    port: Number(process.env.RESTAURANT_PORT),
                },
            },
        ]),
    ],
    providers: [
        RestaurantResolver,
        FoodResovler
    ]
})
export class RestaurantModule { }
