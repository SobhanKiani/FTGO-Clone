import { forwardRef, HttpStatus, INestApplication } from '@nestjs/common';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { FoodModule } from '../../food/food.module';
import { Food } from '../../food/models/food.model';
import { CreateRestaurantDTO } from '../dtos/createRestaurant.dto';
import { Restaurant } from '../models/restaurant.model';
import { RestaurantService } from '../services/restaurant.service';
import { restaurantMockRepo } from '../tests/mocks/restaurantMockRepo';
import { RestaurantController } from './restaurant.controller';

describe('RestaurantController', () => {
  let restaurantController: RestaurantController;
  let restaurantService: RestaurantService
  let authClient: ClientProxy;
  let app: INestApplication
  const createRestaurantData: CreateRestaurantDTO = {
    name: "rest1",
    address: "add1",
    category: "cat1",
    ownerId: "507f1f77bcf86cd799439011"
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ClientsModule.register([
          { name: 'AUTH_SERVICE', transport: Transport.NATS },
        ]),
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory-food:',
          dropSchema: true,
          entities: [Restaurant, Food],
          synchronize: true,
          autoLoadEntities: true
        }),
        TypeOrmModule.forFeature([Restaurant, Food]),
        forwardRef(() => FoodModule)
      ],
      controllers: [RestaurantController],
      providers: [
        RestaurantService,
        // {
        //   provide: getRepositoryToken(Restaurant),
        //   useValue: restaurantMockRepo
        // }
      ]
    }).compile();

    restaurantController = module.get<RestaurantController>(RestaurantController);
    restaurantService = module.get<RestaurantService>(RestaurantService);
    app = module.createNestApplication();
    authClient = app.get('AUTH_SERVICE');

  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(restaurantController).toBeDefined();
  });

  it('should create new restaurant with correct data', async () => {
    const authClientEmitSpy = jest.spyOn(authClient, 'emit');

    const newRestaurant = await restaurantController.createRestaurant(createRestaurantData);
    expect(newRestaurant.status).toEqual(HttpStatus.CREATED);
    expect(newRestaurant.data.name).toEqual(createRestaurantData.name);
    expect(newRestaurant.data.ownerId).toEqual(createRestaurantData.ownerId);
    expect(newRestaurant.errors).toBeNull();
    expect(authClientEmitSpy).toHaveBeenCalled()
    expect(authClientEmitSpy).toHaveBeenCalledWith({ cmd: "restaurant_created" }, { id: newRestaurant.data.ownerId });
  });

  it('should update existing restaurant', async () => {
    const { data: newRestaurant } = await restaurantController.createRestaurant(createRestaurantData);
    const updateObj = { name: 'new name' }
    const { status, data: updateResult } = await restaurantController.updateRestaurant({ id: newRestaurant.id, updateRestaurantDto: updateObj, requestorId: newRestaurant.ownerId });

    expect(status).toEqual(HttpStatus.OK);
    expect(updateResult.affected).toBeGreaterThan(0)
    const { data: updatedRestaurant } = await restaurantController.getRestaurantById(newRestaurant.id);
    expect(updatedRestaurant.name).toEqual(updateObj.name);

  });

  it('should not update if the restaurant does not exists', async () => {
    const updateObj = { name: 'new name' }
    const { status, data: updatedRestaurant } = await restaurantController.updateRestaurant({ id: -1, updateRestaurantDto: updateObj, requestorId: createRestaurantData.ownerId });
    expect(status).toEqual(HttpStatus.NOT_FOUND);
    expect(updatedRestaurant).toBeNull();
  });

  it('should delete existing restaurant', async () => {
    const { data: restaurant } = await restaurantController.createRestaurant(createRestaurantData);
    const { data: deleteRestaurantData, status } = await restaurantController.deleteRestauarnt({ restaurantId: restaurant.id, requestorId: restaurant.ownerId });
    expect(status).toEqual(HttpStatus.OK);
    expect(deleteRestaurantData.id).toEqual(restaurant.id);
  });

  it('should not delete not existing restaurant', async () => {
    const requestorId = "507f1f77bcf86cd799439011"
    const { data: deleteRestaurantData, status } = await restaurantController.deleteRestauarnt({ restaurantId: -1, requestorId: requestorId });
    expect(status).toEqual(HttpStatus.NOT_FOUND);
    expect(deleteRestaurantData).toBeNull()
  })

  it('another person cannot delete another ones restaurant', async () => {
    const { data: newRestaurant } = await restaurantController.createRestaurant(createRestaurantData);
    const requestorId = "testId";
    const { data: deleteRestaurantData, status } = await restaurantController.deleteRestauarnt({ restaurantId: newRestaurant.id, requestorId: requestorId });
    expect(status).toEqual(HttpStatus.FORBIDDEN);
    expect(deleteRestaurantData).toBeNull();
  });

  it('should rate the restaurant', async () => {
    const { data: newRestaurant } = await restaurantController.createRestaurant(createRestaurantData);


    const { status, data: rateResult } = await restaurantController.rateRestauarant({ requestorId: newRestaurant.ownerId, rateDto: { rateNumber: 5, restaurantId: newRestaurant.id } });
    expect(status).toEqual(HttpStatus.OK);
    expect(rateResult.affected).toEqual(1);
  });

  it('should not rate the restuarant if not authenticated', async () => {
    const { data: newRestaurant } = await restaurantController.createRestaurant(createRestaurantData);

    const { status, data: rateResult } = await restaurantController.rateRestauarant({ requestorId: '', rateDto: { rateNumber: 5, restaurantId: newRestaurant.id } });
    expect(status).toEqual(HttpStatus.FORBIDDEN);
    expect(rateResult).toBeNull();
  });

  it('should rate only with number between 1 to 5', async () => {
    const { data: newRestaurant } = await restaurantController.createRestaurant(createRestaurantData);

    const { status: firstStatus, data: firstRateResult } = await restaurantController.rateRestauarant({ requestorId: newRestaurant.ownerId, rateDto: { rateNumber: -1, restaurantId: newRestaurant.id } });
    expect(firstStatus).toEqual(HttpStatus.BAD_REQUEST);
    expect(firstRateResult).toBeNull();

    const { status: secondStatus, data: secondRateResult } = await restaurantController.rateRestauarant({ requestorId: newRestaurant.ownerId, rateDto: { rateNumber: -1, restaurantId: newRestaurant.id } });
    expect(secondStatus).toEqual(HttpStatus.BAD_REQUEST);
    expect(secondRateResult).toBeNull();
  });

  it('should not rate if restaurant does not exists', async () => {
    const { status, data } = await restaurantController.rateRestauarant({ requestorId: 'testId', rateDto: { rateNumber: 5, restaurantId: -1 } });
    expect(status).toEqual(HttpStatus.NOT_FOUND);
    expect(data).toBeNull();
  });
});
