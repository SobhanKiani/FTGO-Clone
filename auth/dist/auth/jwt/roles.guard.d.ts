import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Model } from 'mongoose';
import { UserDocument } from '../models/user.model';
export declare class RolesGuard implements CanActivate {
    private reflector;
    private readonly userModel;
    constructor(reflector: Reflector, userModel: Model<UserDocument>);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
