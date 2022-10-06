import { User, UserSchema } from '../models/user.model';
import * as bcrypt from 'bcryptjs';

export const UserSchemaObject = {
  name: User.name,
  useFactory: () => {
    const schema = UserSchema;

    schema.pre<User>('save', async function (next: Function) {
      if (this.isModified('password')) {
        const hashedPassword = await bcrypt.hash(this.password, 8);

        this.set('password', hashedPassword);
      }
      next();
    });

    return schema;
  },
};
