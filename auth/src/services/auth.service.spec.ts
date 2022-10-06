import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Model } from 'mongoose';
import { JwtStrategy } from '../jwt/jwt-startegt.class';
import { RolesGuard } from '../jwt/roles.guard';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../jwt/constants';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { UserSchemaObject } from '../db-schema-objects/user.schema-object';
import { INestApplication } from '@nestjs/common';
import { User } from '../models/user.model';
import { AuthController } from '../controllers/auth.controller';
import { clientProxyMock } from '../../test/mocks/client-proxy.mock';

describe('AuthService', () => {
  let authService: AuthService;
  let authController: AuthController;
  let app: INestApplication;
  let mongo: MongoMemoryServer;
  let testModule: TestingModule;
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
        { provide: 'NATS_SERVICE', useValue: clientProxyMock },
      ],
      controllers: [AuthController],
    }).compile();

    authService = testModule.get<AuthService>(AuthService);
    authController = testModule.get<AuthController>(AuthController);
    app = testModule.createNestApplication();

    await app.init();
  });

  afterEach(async () => {
    jest.restoreAllMocks();
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
    expect(authService).toBeDefined();
  });

  it('should get existing user by email', async () => {
    const { data: authData } = await authController.signUp(userCreateData);
    const foundUser = await authService.getUserByEmail(authData.user.email);
    expect(foundUser.email).toEqual(userCreateData.email);
  });

  it('should not get not existing user with email', async () => {
    const user = await authService.getUserByEmail('notExistingUser@gmail.com');
    expect(user).toBeNull();
  });

  it('should get existing user by id', async () => {
    const { data: authData } = await authController.signUp(userCreateData);
    const foundUser = await authService.getUserById(authData.user.id);
    expect(foundUser.email).toEqual(userCreateData.email);
  });

  it('should not get not existing user by id', async () => {
    const user = await authService.getUserById(new mongoose.Types.ObjectId());
    expect(user).toBeNull();
  });

  it('should create user by valid data', async () => {
    const newUser = await authService.createUser(userCreateData);
    expect(newUser.email).toEqual(userCreateData.email);
  });

  it('should not create user by invalid data', async () => {
    const createData = {
      ...userCreateData,
      password: 'invalidPass',
      email: 'invalid email',
    };
    await expect(authService.createUser(createData)).rejects.toThrowError();
  });

  it('should return true for equal passwords and false for not equal ones', async () => {
    const { data: authData } = await authController.signUp(userCreateData);
    const isValid = await authData.user.isPasswordValid(
      userCreateData.password,
    );
    const isNotValid = await authData.user.isPasswordValid('testpass');
    expect(isValid).toEqual(true);
    expect(isNotValid).toEqual(false);
  });

  it('should update existing user', async () => {
    const { data: authData } = await authController.signUp(userCreateData);
    const updateData = {
      address: 'User Address',
      firstName: 'NewFirstName',
    };

    const updatedUser = await authService.updateUser(
      authData.user.id,
      updateData,
    );

    expect(updatedUser.firstName).toEqual(updateData.firstName);
    expect(updatedUser.address).toEqual(updateData.address);
  });

  it('should not update not existing user', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const updateData = {
      address: 'User Address',
      firstName: 'NewFirstName',
    };

    const updatedUser = await authService.updateUser(fakeId, updateData);
    expect(updatedUser).toBeNull();
  });

  it('should create token for a user', async () => {
    const { data: authData } = await authController.signUp(userCreateData);
    const token = authService.createToken(authData.user);
    expect(token).toBeDefined();
  });

  it('should give existing user an admin role', async () => {
    const { data: authData } = await authController.signUp(userCreateData);

    const updatedUser = await authService.makeUserAdmin(authData.user.id);
    expect(updatedUser.roles).toContain('Admin');
  });

  it('should not give no existing user admin role', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const updatedUser = await authService.makeUserAdmin(fakeId);
    expect(updatedUser).toBeNull();
  });

  it('should return user from valid token', async () => {
    const { data: authData } = await authController.signUp(userCreateData);
    const foundUser = await authService.decodeToken(authData.token);
    expect(foundUser.email).toEqual(userCreateData.email);
  });

  it('should not decode token for valid token', async () => {
    const fakeToken = new JwtService({
      secretOrPrivateKey: jwtConstants.secret,
    }).sign({ email: 'testemail2', id: new mongoose.Types.ObjectId() });
    const foundUser = await authService.decodeToken(fakeToken);

    expect(foundUser).toBeNull();
  });
});
