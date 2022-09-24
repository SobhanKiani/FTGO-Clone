import {
  HttpStatus,
  INestApplication,
} from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ClientProxy, } from '@nestjs/microservices';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Model } from 'mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { UserSchemaObject } from '../DbSchemaObjects/user.schema-object';
import { jwtConstants } from '../jwt/constants';
import { JwtStrategy } from '../jwt/jwt-startegt.class';
import { RolesGuard } from '../jwt/roles.guard';
import { User } from '../models/user.model';
import { Role } from '../enums/roles.enum';
import { clientProxyMock } from '../../../test/mocks/client-proxy.mock';


describe('AuthController', () => {
  let authController: AuthController;
  let app: INestApplication;
  let mongo: MongoMemoryServer;
  let natsClient: ClientProxy;
  let userModel: Model<User>;
  let testModule: TestingModule;
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

    testModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: jwtConstants.secret,
          signOptions: {
            expiresIn: '30d',
          },
        }),
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
        { provide: "NATS_SERVICE", useValue: clientProxyMock }
      ],
      controllers: [AuthController],
    }).compile();

    authController = testModule.get<AuthController>(AuthController);

    app = testModule.createNestApplication();
    natsClient = app.get('NATS_SERVICE');

    // app.connectMicroservice({
    //   transport: Transport.NATS,
    // });
    // await app.startAllMicroservices();
    await app.init();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.close();
    if (mongo) {
      await mongo.stop();
    }
    await app.close();
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
    const result = await authController.check({});
    expect(result.Check_Status).toBeDefined();
  });

  it('should create user with correct data', async () => {
    const orderClientEmitSpy = jest.spyOn(natsClient, 'emit');


    const result = await authController.signUp(userCreateData);
    expect(result.status).toEqual(HttpStatus.CREATED);
    expect(result.data.token).toBeDefined()
    expect(result.data.user.email).toBe(userCreateData.email);
    expect(orderClientEmitSpy).toHaveBeenCalled();
  });

  it('should not create user with inappropriate data', async () => {
    const userData = { ...userCreateData, email: 'errorTest' };
    const result = await authController.signUp(userData);

    expect(result.status).toEqual(HttpStatus.BAD_REQUEST);
    expect(result.data).toBeNull();
  });

  it('should login existing user with correct credentials', async () => {
    await authController.signUp(userCreateData);

    const result = await authController.login({
      email: userCreateData.email,
      password: userCreateData.password,
    });

    expect(result.status).toEqual(HttpStatus.OK);
    expect(result.data.token).toBeDefined();
    expect(result.data.user.email).toEqual(userCreateData.email);
  });

  it('should update existing user with correct data', async () => {
    const orderClientEmitSpy = jest.spyOn(natsClient, 'emit');

    const { data: newUser } = await authController.signUp(userCreateData);

    const userUpdateData = {
      address: 'new address',
      firstName: 'NewFirstName',
    };

    const { data: resultData, status } = await authController.updateUser(
      {
        userUpdateDTO: userUpdateData,
        userId: newUser.user.id,
      }
    );
    expect(status).toEqual(HttpStatus.OK);
    expect(resultData.address).toBe(userUpdateData.address);
    expect(resultData.firstName).toBe(userUpdateData.firstName);
    expect(orderClientEmitSpy).toHaveBeenCalled();
  });

  it('should verify existing user', async () => {
    const { data: authData } = await authController.signUp(userCreateData);
    const { data: resultData, status } = await authController.verifyUser({ token: authData.token });

    expect(resultData.id).toEqual(authData.user.id);
    expect(status).toEqual(HttpStatus.OK);
  });

  it('should make user admin', async () => {
    const { data: authData } = await authController.signUp(userCreateData);
    const { data: resultData, status } = await authController.makeUserAdmin(authData.user.id);
    expect(resultData.roles).toContain('Admin');
    expect(status).toEqual(HttpStatus.OK);
  });

  it('should not verify a user that does not exist', async () => {
    const { data: resultData, status } = await authController.verifyUser({
      token: new JwtService({
        secretOrPrivateKey: jwtConstants.secret,
      }).sign({ email: 'testemail2', id: new mongoose.Types.ObjectId() }),
    });

    expect(resultData).toBeNull();
    expect(status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('should verify admin', async () => {
    const { data: authData } = await authController.signUp(userCreateData);
    await authController.makeUserAdmin(authData.user.id);

    const { data: updatedUser, status } = await authController.verifyRoles({
      token: authData.token,
      roles: ['Admin'],
    });
    expect(status).toEqual(HttpStatus.OK);
    expect(updatedUser.roles).toContain('Admin');
  });

  it('should not verify admin that does not have the admin role', async () => {
    const { data: authData } = await authController.signUp(userCreateData);
    const { data: resultData, status } = await authController.verifyRoles({ token: authData.token, roles: ['Admin'] });
    expect(status).toEqual(HttpStatus.FORBIDDEN);
    expect(resultData).toBeNull();
  });

  it('should not verify admin that does not exists', async () => {
    const fakeToken = new JwtService({
      secretOrPrivateKey: jwtConstants.secret,
    }).sign({ email: 'testemail2', id: new mongoose.Types.ObjectId() });

    const { data: resultData, status } = await authController.verifyRoles({ token: fakeToken, roles: ['Admin'] });
    expect(status).toEqual(HttpStatus.UNAUTHORIZED);
    expect(resultData).toBeNull();
  });

  it('should return user with restaurant role when restaurant is created', async () => {
    const { data: authData } = await authController.signUp(userCreateData);
    const { status, data } = await authController.restaurantCreatedHandler({ ownerId: authData.user.id });
    expect(status).toEqual(HttpStatus.OK);
    expect(data.roles).toContain(Role.RestaurantOwner)
  })
});
