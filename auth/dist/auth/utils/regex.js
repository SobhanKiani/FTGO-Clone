"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PHONE_NUMBER_REGEX = exports.PASSWORD_REGEX = exports.EMAIL_REGEX = void 0;
exports.EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
exports.PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
exports.PHONE_NUMBER_REGEX = /^(0|0098|\+98)9(0[1-5]|[1 3]\d|2[0-2]|98)\d{7}$/;
//# sourceMappingURL=regex.js.map