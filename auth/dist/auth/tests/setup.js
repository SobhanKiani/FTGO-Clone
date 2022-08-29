"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = require("mongoose");
let mongo;
beforeAll(async () => {
    mongo = await mongodb_memory_server_1.MongoMemoryServer.create();
    const mongoUri = await mongo.getUri();
    await mongoose_1.default.connect(mongoUri);
});
//# sourceMappingURL=setup.js.map