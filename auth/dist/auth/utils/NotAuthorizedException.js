"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotAuthorizedException = void 0;
const common_1 = require("@nestjs/common");
class NotAuthorizedException extends common_1.HttpException {
    constructor() {
        super('Not Authorized', common_1.HttpStatus.FORBIDDEN);
    }
}
exports.NotAuthorizedException = NotAuthorizedException;
//# sourceMappingURL=NotAuthorizedException.js.map