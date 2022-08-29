"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const auth_service_1 = require("./auth.service");
const get_user_from_request_decorator_1 = require("./decorators/get-user-from-request.decorator");
const login_dto_1 = require("./dto&params/login.dto");
const signUp_dto_1 = require("./dto&params/signUp.dto");
const user_detail_param_1 = require("./dto&params/user-detail.param");
const user_update_dto_1 = require("./dto&params/user-update.dto");
const verifyUser_dto_1 = require("./dto&params/verifyUser.dto");
const user_model_1 = require("./models/user.model");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    check() {
        return {
            Check_Status: 'NestJS Auth Is Working',
        };
    }
    async signUp(signUpDTO) {
        return await this.authService.signUp(signUpDTO);
    }
    async login(loginDTO) {
        return await this.authService.login(loginDTO);
    }
    async updateUser(userUpdateDTO, user) {
        return await this.authService.updateUser(user.id, userUpdateDTO);
    }
    async verifyUser(verifyUserDTO) {
        return await this.authService.decodeToken(verifyUserDTO.token);
    }
    async verifyAdmin(verifyUserDTO) {
        const user = await this.authService.decodeToken(verifyUserDTO.token);
        if (!user.roles.includes('Admin')) {
            throw new common_1.NotFoundException("Admin Not Found");
        }
        return user;
    }
    async makeUserAdmin(params) {
        return await this.authService.makeUserAdmin(params.id);
    }
};
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: "AUTH_check" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "check", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: "AUTH_signUp" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signUp_dto_1.SignUpDTO]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signUp", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: "AUTH_login" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDTO]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: "AUTH_updateUser" }),
    __param(1, (0, get_user_from_request_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_update_dto_1.UserUpdateDTO,
        user_model_1.User]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateUser", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: "AUTH_verifyUser" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verifyUser_dto_1.VerifyUserDTO]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyUser", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: "AUTH_verifyAdmin" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verifyUser_dto_1.VerifyUserDTO]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyAdmin", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: "AUTH_makeUserAdmin" }),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_detail_param_1.UserIdParam]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "makeUserAdmin", null);
AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map