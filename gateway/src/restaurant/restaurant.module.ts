import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { RestaurantResolver } from './resolvers/restaurant.resolver';

@Module({
    imports: [
        AuthenticationModule,
        ClientsModule.register([
            {
                name: 'RESTAURANT_SERVICE',
                transport: Transport.TCP,
                options: {
                    host: 'ftgo-restaurant',
                    port: 9993,
                },
            },
        ]),
    ],
    providers: [
        RestaurantResolver
    ]
})
export class RestaurantModule { }
