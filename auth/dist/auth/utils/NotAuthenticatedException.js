"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotAuthenticatedException = void 0;
const common_1 = require("@nestjs/common");
class NotAuthenticatedException extends common_1.HttpException {
    constructor() {
        super('Not Authenticated', common_1.HttpStatus.FORBIDDEN);
    }
}
exports.NotAuthenticatedException = NotAuthenticatedException;
//# sourceMappingURL=NotAuthenticatedException.js.map