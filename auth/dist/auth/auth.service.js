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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const microservices_1 = require("@nestjs/microservices");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_model_1 = require("./models/user.model");
let AuthService = class AuthService {
    constructor(userModel, jwtService, orderClient) {
        this.userModel = userModel;
        this.jwtService = jwtService;
        this.orderClient = orderClient;
    }
    async signUp(signUpDTO) {
        try {
            const newUser = new this.userModel(signUpDTO);
            await newUser.save();
            const token = await this.createToken(newUser);
            this.orderClient.emit('NEW_USER_CREATED', newUser);
            return {
                user: newUser,
                token,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.errors);
        }
    }
    async login(loginDTO) {
        const user = await this.userModel.findOne({ email: loginDTO.email });
        if (!user || !await user.isPasswordValid(loginDTO.password)) {
            throw new common_1.BadRequestException('Could Not Login With This Crientials');
        }
        const token = await this.createToken(user);
        return {
            user,
            token,
        };
    }
    async updateUser(id, userUpdateDTO) {
        const user = await this.userModel.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User Not Found');
        }
        user.set(userUpdateDTO);
        await user.save();
        this.orderClient.emit('USER_UPDATE', user);
        return user;
    }
    async createToken(user) {
        try {
            return await this.jwtService.sign({ id: user.id, email: user.email });
        }
        catch (error) {
            throw new common_1.BadRequestException('Could Generate JWT');
        }
    }
    async makeUserAdmin(id) {
        const user = await this.userModel.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User Not Found');
        }
        if (!user.roles.includes('Admin')) {
            user.roles.push('Admin');
        }
        await user.save();
        return user;
    }
    async decodeToken(token) {
        const decodedToken = this.jwtService.decode(token);
        const user = await this.userModel.findById(decodedToken.id);
        if (!user) {
            throw new common_1.NotFoundException('User Not Found');
        }
        return user;
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_model_1.User.name)),
    __param(2, (0, common_1.Inject)('ORDER_SERVICE')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService,
        microservices_1.ClientProxy])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map