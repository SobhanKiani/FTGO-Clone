import { User } from '../models/user.model';
export declare const UserSchemaObject: {
    name: string;
    useFactory: () => import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, any>, {}, {}, {}, {}, "type", User>;
};
