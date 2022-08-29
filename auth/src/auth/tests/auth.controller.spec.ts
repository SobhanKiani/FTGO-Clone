import { BadRequestException, INestApplication, NotFoundException } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Model } from 'mongoose';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { UserSchemaObject } from '../DbSchemaObjects/user.schema-object';
import { jwtConstants } from '../jwt/constants';
import { JwtStrategy } from '../jwt/jwt-startegt.class';
import { RolesGuard } from '../jwt/roles.guard';
import { User } from '../models/user.model';

describe('AuthController', () => {
  let authController: AuthController;
  let app: INestApplication;
  let mongo: MongoMemoryServer;
  let userModel: Model<User>;
  process.env.JWT_KEY = jwtConstants.secret;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const userCreateData = {
    email: 'test@gmail.com',
    firstName: 'Test',
    lastName: 'Testian',
    password: 'Thisispass2010@',
    phoneNumber: '+989136421265',
  };

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const mongoUri = await mongo.getUri();
    await mongoose.connect(mongoUri);

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: jwtConstants.secret,
          signOptions: {
            expiresIn: '30d',
          },
        }),
        ClientsModule.register([
          { name: 'ORDER_SERVICE', transport: Transport.NATS },
        ]),
        MongooseModule.forRootAsync({
          useFactory: async () => ({
            uri: await mongo.getUri(),
          }),
        }),
        MongooseModule.forFeatureAsync([UserSchemaObject]),
      ],
      providers: [
        AuthService,
        JwtStrategy,
        RolesGuard,
        { provide: getModelToken(User.name), useValue: userModel },
      ],
      controllers: [AuthController]
    }).compile();

    authController = module.get<AuthController>(AuthController)

    app = module.createNestApplication();
    // app.connectMicroservice({
    //   transport: Transport.NATS,
    // });
    // await app.startAllMicroservices();
    await app.init();
  });


  afterAll(async () => {
    await mongoose.connection.close();
    if (mongo) {
      await mongo.stop();
    }
    // await app.close();
  });

  beforeEach(async () => {
    const collections = await mongoose?.connection?.db?.collections();
    if (collections) {
      for (const collection of collections) {
        await collection.deleteMany({});
      }
    }
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('should return check data', async () => {
    const result = await authController.check();
    expect(result.Check_Status).toBeDefined();
  });

  it('should create user with correct data', async () => {
    const result = await authController.signUp(userCreateData);
    expect(result.token).toBeDefined();
    expect(result.user.email).toBe(userCreateData.email);
  })

  it('should not create user with inappropriate data', async () => {
    const userData = { ...userCreateData, email: "errorTest" };
    await expect(authController.signUp(userData)).rejects.toThrowError(BadRequestException);
  })

  it('should login existing user with correct credentials', async () => {
    await authController.signUp(userCreateData);

    const result = await authController.login({ email: userCreateData.email, password: userCreateData.password });
    expect(result.token).toBeDefined();
    expect(result.user.email).toEqual(userCreateData.email);

  })

  it('should update existing user with correct data', async () => {
    const newUser = await authController.signUp(userCreateData);

    const userUpdateData = {
      address: "new address",
      firstName: "NewFirstName"
    }

    const result = await authController.updateUser(userUpdateData, newUser.user);
    expect(result.address).toBe(userUpdateData.address);
    expect(result.firstName).toBe(userUpdateData.firstName);
  });

  it('should verify existing user', async () => {
    const newUser = await authController.signUp(userCreateData);
    const result = await authController.verifyUser({ token: newUser.token });

    expect(result.id).toEqual(newUser.user.id);
  });

  it('should make user admin', async () => {
    const newUser = await authController.signUp(userCreateData);
    const result = await authController.makeUserAdmin({ id: newUser.user.id });
    expect(result.roles).toContain('Admin');
  })

  it('should not verify a user that does not exist', async () => {
    await expect(
      authController.verifyUser({
        token: new JwtService({
          secretOrPrivateKey: jwtConstants.secret
        }).sign({ email: "testemail2", id: new mongoose.Types.ObjectId() })
      })).rejects.toThrowError(NotFoundException);
  });

  it('should verify admin', async () => {
    const newUser = await authController.signUp(userCreateData);
    await authController.makeUserAdmin({ id: newUser.user.id });

    const result = await authController.verifyAdmin({ token: newUser.token });
    expect(result.roles).toContain("Admin");
  });

  it('should not verify admin that does not exist', async () => {
    const newUser = await authController.signUp(userCreateData);
    await expect(authController.verifyAdmin({ token: newUser.token })).rejects.toThrowError(NotFoundException);
  });
});
