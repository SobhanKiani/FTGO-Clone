import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import {  MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Model } from 'mongoose';
import { JwtStrategy } from '../jwt/jwt-startegt.class';
import { RolesGuard } from '../jwt/roles.guard';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../jwt/constants';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { UserSchemaObject } from '../DbSchemaObjects/user.schema-object';
import { BadRequestException, INestApplication, NotFoundException } from '@nestjs/common';
import { User } from '../models/user.model';

describe('AuthService', () => {
  let authService: AuthService;
  let app: INestApplication;
  let mongo: MongoMemoryServer;
  let orderClient: ClientProxy;
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
    }).compile();

    authService = module.get<AuthService>(AuthService);

    app = module.createNestApplication();
    app.connectMicroservice({
      transport: Transport.NATS,
    });
    // await app.startAllMicroservices();
    // await app.connectMicroservice({
    //   trasport:Transport.NATS
    // })
    await app.init();

    orderClient = app.get('ORDER_SERVICE');
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

  it('should signUp with correct data', async () => {
    const orderClientEmitSpy = jest.spyOn(orderClient, 'emit');

    const result = await authService.signUp(userCreateData);

    expect(result.user.email).toBe(userCreateData.email);
    expect(result.token).toBeDefined();
    expect(orderClientEmitSpy).toHaveBeenCalled();
  });

  it('should not create user if data is not valid', async () => {
    const userData = {
      email: 'test',
      firstName: 'testName',
      lastName: 'testLastName',
      password: 'testpass',
      phoneNumber: '1212',
    };

    const orderClientEmitSpy = jest.spyOn(orderClient, 'emit');

    await expect(authService.signUp(userData)).rejects.toThrowError(
      BadRequestException,
    );

    expect(orderClientEmitSpy).not.toHaveBeenCalled();

  });

  it.only('should login user with right cridentials', async () => {
    await authService.signUp(userCreateData);

    const result = await authService.login({
      email: userCreateData.email,
      password: userCreateData.password,
    });

    expect(result.token).toBeDefined();
    expect(result.user.email).toEqual(userCreateData.email);
  });

  it('should not login with not correct email or password', async () => {

    await authService.signUp(userCreateData);

    await expect(
      authService.login({
        email: userCreateData.email,
        password: 'NotCorrectPass0@',
      })
    ).rejects.toThrowError(BadRequestException);

    await expect(
      authService.login({
        email: 'notCorrectEmail@gmail.com',
        password: userCreateData.password
      })
    ).rejects.toThrowError(BadRequestException);
  });

  it('should update existing user', async () => {
    const newUser = await authService.signUp(userCreateData);
    const updateData = {
      address: "User Address",
      firstName: "NewFirstName"
    }

    const orderClientEmitSpy = jest.spyOn(orderClient, 'emit');

    const result = await authService.updateUser(newUser.user.id, updateData)

    expect(result.address).toEqual(updateData.address);
    expect(result.firstName).toEqual(updateData.firstName);
    expect(orderClientEmitSpy).toHaveBeenCalled

  })

  it('should not update user that does not exist', async () => {
    const updateData = {
      address: "User Address",
      firstName: "NewFirstName"
    }

    const orderClientEmitSpy = jest.spyOn(orderClient, 'emit');


    await expect(authService.updateUser(new mongoose.Types.ObjectId(), updateData)).rejects.toThrowError(NotFoundException);
    expect(orderClientEmitSpy).not.toHaveBeenCalled
  })

  it('should create token for user', async () => {
    const newUser = await authService.signUp(userCreateData);
    const result = await authService.createToken(newUser.user);

    expect(result).toBeDefined();
    expect(typeof result).toBe("string")
  })

  it('should make user admin if user exists', async () => {
    const newUser = await authService.signUp(userCreateData);

    const result = await authService.makeUserAdmin(newUser.user.id);

    expect(result.roles).toContain('Admin');
  })

  it('should not make a admin if the user does not exist', async () => {
    await expect(authService.makeUserAdmin(new mongoose.Types.ObjectId())).rejects.toThrowError(NotFoundException);
  })

  it('should verify valid token', async () => {
    const newUser = await authService.signUp(userCreateData);

    const result = await authService.decodeToken(newUser.token);
    expect(result.id).toBe(newUser.user.id);
  })

  it('should not verify invalid token', async () => {
    await expect(
      authService.decodeToken(
        new JwtService({
          secretOrPrivateKey: jwtConstants.secret
        }).sign({ email: "testemail2", id: new mongoose.Types.ObjectId() })
      )
    ).rejects.toThrowError(NotFoundException);
  })
});
