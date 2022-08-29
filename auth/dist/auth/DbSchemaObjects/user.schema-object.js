"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchemaObject = void 0;
const user_model_1 = require("../models/user.model");
const bcrypt = require("bcryptjs");
exports.UserSchemaObject = {
    name: user_model_1.User.name,
    useFactory: () => {
        const schema = user_model_1.UserSchema;
        schema.pre('save', async function (next) {
            if (this.isModified('password')) {
                const hashedPassword = await bcrypt.hash(this.password, 8);
                this.set('password', hashedPassword);
            }
            next();
        });
        return schema;
    },
};
//# sourceMappingURL=user.schema-object.js.map