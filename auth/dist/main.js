"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const microservices_1 = require("@nestjs/microservices");
const app_module_1 = require("./app.module");
const queueGroupName_1 = require("./utils/queueGroupName");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { cors: true });
    console.log(process.env.NATS_URL);
    app.connectMicroservice({
        transport: microservices_1.Transport.NATS,
        options: {
            servers: ['nats://nats-server:4222'],
            queue: queueGroupName_1.QUEUE_GROUP_NAME,
        },
    });
    app.useGlobalPipes(new common_1.ValidationPipe());
    app.startAllMicroservices();
    await app.listen(9991);
}
bootstrap();
//# sourceMappingURL=main.js.map