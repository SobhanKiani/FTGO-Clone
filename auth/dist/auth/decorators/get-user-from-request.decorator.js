"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUser = void 0;
const common_1 = require("@nestjs/common");
const NotAuthenticatedException_1 = require("../utils/NotAuthenticatedException");
exports.GetUser = (0, common_1.createParamDecorator)((data, req) => {
    const user = req.switchToHttp().getRequest().user;
    if (!user) {
        throw new NotAuthenticatedException_1.NotAuthenticatedException();
    }
    return user;
});
//# sourceMappingURL=get-user-from-request.decorator.js.map