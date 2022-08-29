import { MongooseModuleOptions } from '@nestjs/mongoose';
export declare const rootMongooseTestModule: (options?: MongooseModuleOptions) => import("@nestjs/common").DynamicModule;
export declare const closeInMongodConnection: () => Promise<void>;
