import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateRestaurantDTO } from '../../dto/restaurant/createRestaurant.dto';
import { Restaurant } from '../../models/restaurant.model';
import { CreateFoodDTO } from '../../dto/food/create-food.dto';
import { Food } from '../../models/food.model';
import { FoodController } from './food.controller';
import { clientProxyMock } from '../../../test/mocks/client-proxy.mock';
import { ClientProxy } from '@nestjs/microservices';
import { ICreateFoodEvent } from '../../interfaces/food/events/create-food.event';
import { IUpdateFoodEvent } from '../../interfaces/food/events/update-food.event';
import { RestaurantController } from '../restaurant/restaurant.controller';
import { FoodService } from '../../services/food/food.service';
import { RestaurantService } from '../../services/restaurant/restaurant.service';

describe('FoodController', () => {
  let foodController: FoodController;
  let restaurantController: RestaurantController;
  let natsClient: ClientProxy;
  const createRestaurantData: CreateRestaurantDTO = {
    name: 'rest1',
    address: 'add1',
    category: 'cat1',
    ownerId: '507f1f77bcf86cd799439011',
  };
  const createFoodData = {
    name: 'Food1',
    category: 'FoodCat1',
    price: 10.15,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory-food-controller:',
          dropSchema: true,
          entities: [Restaurant, Food],
          synchronize: true,
          autoLoadEntities: true,
        }),
        TypeOrmModule.forFeature([Food, Restaurant]),
      ],
      controllers: [FoodController, RestaurantController],
      providers: [
        FoodService,
        RestaurantService,
        {
          provide: 'NATS_SERVICE',
          useValue: clientProxyMock,
        },
      ],
    }).compile();

    foodController = module.get<FoodController>(FoodController);
    restaurantController =
      module.get<RestaurantController>(RestaurantController);
    natsClient = module.get<ClientProxy>('NATS_SERVICE');
  });

  it('should be defined', () => {
    expect(foodController).toBeDefined();
    expect(restaurantController).toBeDefined();
  });

  it('should create food with correct data', async () => {
    const emit = jest.spyOn(natsClient, 'emit');

    const { data: newRestaurant } = await restaurantController.createRestaurant(
      createRestaurantData,
    );
    const createFoodDto: CreateFoodDTO = {
      ...createFoodData,
      restaurantId: newRestaurant.id,
    };
    const requestorId = createRestaurantData.ownerId;
    const { status, data: newFood } = await foodController.createFood({
      requestorId,
      createFoodDto,
    });
    expect(status).toEqual(HttpStatus.CREATED);
    expect(newFood.id).toBeDefined();
    expect(newFood.name).toEqual(createFoodDto.name);

    const eventData: ICreateFoodEvent = {
      id: newFood.id,
      name: newFood.name,
      category: newFood.category,
      price: newFood.price,
      isAvailable: newFood.isAvailable,
    };
    expect(emit).toHaveBeenCalled();
    expect(emit).toHaveBeenCalledWith({ cmd: 'create_food' }, eventData);
  });

  it('should not create food if restaurant does not exists', async () => {
    const createFoodDto: CreateFoodDTO = {
      ...createFoodData,
      restaurantId: -1,
    };
    const requestorId = createRestaurantData.ownerId;
    const { status, data: newFood } = await foodController.createFood({
      requestorId,
      createFoodDto,
    });
    expect(status).toEqual(HttpStatus.NOT_FOUND);
    expect(newFood).toBeNull();
  });

  it('should not create user if requestorId is not equal to restuarant owner', async () => {
    const { data: newRestaurant } = await restaurantController.createRestaurant(
      createRestaurantData,
    );
    const createFoodDto: CreateFoodDTO = {
      ...createFoodData,
      restaurantId: newRestaurant.id,
    };
    const requestorId = 'testId';
    const { status, data: newFood } = await foodController.createFood({
      requestorId,
      createFoodDto,
    });
    expect(status).toEqual(HttpStatus.FORBIDDEN);
    expect(newFood).toBeNull();
  });

  it('should update exisiting food', async () => {
    const { data: newRestaurant } = await restaurantController.createRestaurant(
      createRestaurantData,
    );
    const createFoodDto: CreateFoodDTO = {
      ...createFoodData,
      restaurantId: newRestaurant.id,
    };
    const requestorId = createRestaurantData.ownerId;
    const { data: newFood } = await foodController.createFood({
      requestorId,
      createFoodDto,
    });

    const emit = jest.spyOn(natsClient, 'emit');
    const updateFoodDto = { name: 'new name' };
    const { status, data: updateResult } = await foodController.updateFood({
      foodId: newFood.id,
      requestorId,
      updateFoodDto,
    });
    expect(status).toEqual(HttpStatus.OK);

    expect(updateResult.affected).toEqual(1);
    const { data: updatedFood } = await foodController.getFoodById({
      foodId: newFood.id,
    });

    expect(updatedFood.name).toEqual(updateFoodDto.name);
    const eventData: IUpdateFoodEvent = {
      id: newFood.id,
      data: {
        ...updateFoodDto,
      },
    };

    expect(emit).toHaveBeenCalled();
    expect(emit).toHaveBeenCalledWith({ cmd: 'update_food' }, eventData);
  });

  it('should not update not existing food', async () => {
    const updateFoodDto = { name: 'new name' };
    const { status, data: updateResult } = await foodController.updateFood({
      foodId: -1,
      requestorId: 'testId',
      updateFoodDto,
    });
    expect(status).toEqual(HttpStatus.NOT_FOUND);
    expect(updateResult).toBeNull();
  });

  it('should not delete another owner restaurant', async () => {
    const { data: newRestaurant } = await restaurantController.createRestaurant(
      createRestaurantData,
    );
    const createFoodDto: CreateFoodDTO = {
      ...createFoodData,
      restaurantId: newRestaurant.id,
    };
    const requestorId = createRestaurantData.ownerId;
    const { data: newFood } = await foodController.createFood({
      requestorId,
      createFoodDto,
    });

    const updateFoodDto = { name: 'new name' };
    const { status, data: updateResult } = await foodController.updateFood({
      foodId: newFood.id,
      requestorId: 'testId',
      updateFoodDto,
    });
    expect(status).toEqual(HttpStatus.FORBIDDEN);
    expect(updateResult).toBeNull();
  });

  it('should delete existing food', async () => {
    const { data: newRestaurant } = await restaurantController.createRestaurant(
      createRestaurantData,
    );
    const createFoodDto: CreateFoodDTO = {
      ...createFoodData,
      restaurantId: newRestaurant.id,
    };
    const requestorId = createRestaurantData.ownerId;
    const { data: newFood } = await foodController.createFood({
      requestorId,
      createFoodDto,
    });

    const deleteFunc = jest.spyOn(natsClient, 'emit');

    const { status, data: deleteResult } = await foodController.deleteFood({
      requestorId,
      foodId: newFood.id,
    });
    expect(status).toEqual(HttpStatus.OK);
    expect(deleteResult.affected).toEqual(1);

    const { data: deletedFood } = await foodController.getFoodById({
      foodId: newFood.id,
    });
    expect(deletedFood).toBeNull();

    expect(deleteFunc).toHaveBeenCalled();
    expect(deleteFunc).toHaveBeenCalledWith(
      { cmd: 'delete_food' },
      { id: newFood.id },
    );
  });

  it('should not delete food that does not exist', async () => {
    const { status, data: deleteResult } = await foodController.deleteFood({
      requestorId: 'testId',
      foodId: -1,
    });
    expect(status).toEqual(HttpStatus.NOT_FOUND);
    expect(deleteResult).toBeNull();
  });

  it('should not delete another ones food', async () => {
    const { data: newRestaurant } = await restaurantController.createRestaurant(
      createRestaurantData,
    );
    const createFoodDto: CreateFoodDTO = {
      ...createFoodData,
      restaurantId: newRestaurant.id,
    };
    const requestorId = createRestaurantData.ownerId;
    const { data: newFood } = await foodController.createFood({
      requestorId,
      createFoodDto,
    });

    const { status, data: deleteResult } = await foodController.deleteFood({
      requestorId: 'testId',
      foodId: newFood.id,
    });
    expect(status).toEqual(HttpStatus.FORBIDDEN);
    expect(deleteResult).toBeNull();
  });

  it('should get food list', async () => {
    const { data: newRestaurant } = await restaurantController.createRestaurant(
      createRestaurantData,
    );
    const createFoodDto: CreateFoodDTO = {
      ...createFoodData,
      restaurantId: newRestaurant.id,
    };
    const requestorId = createRestaurantData.ownerId;
    const { data: newFood } = await foodController.createFood({
      requestorId,
      createFoodDto,
    });

    const { status: firstStatus, data: foodList } =
      await foodController.getFoodList({});
    expect(firstStatus).toEqual(HttpStatus.OK);
    expect(foodList).toHaveLength(1);

    const { status: secondStatus, data: secondfoodList } =
      await foodController.getFoodList({ name: newFood.name });
    expect(secondStatus).toEqual(HttpStatus.OK);
    expect(secondfoodList).toHaveLength(1);
  });

  it('should get food by id if food exists', async () => {
    const { data: newRestaurant } = await restaurantController.createRestaurant(
      createRestaurantData,
    );
    const createFoodDto: CreateFoodDTO = {
      ...createFoodData,
      restaurantId: newRestaurant.id,
    };
    const requestorId = createRestaurantData.ownerId;
    const { data: newFood } = await foodController.createFood({
      requestorId,
      createFoodDto,
    });

    const { status, data: food } = await foodController.getFoodById({
      foodId: newFood.id,
    });
    expect(status).toEqual(HttpStatus.OK);
    expect(food.name).toEqual(newFood.name);
    expect(food.restaurant.id).toBeDefined();
  });

  it('should not get food that does not exists', async () => {
    const { status, data: food } = await foodController.getFoodById({
      foodId: -1,
    });
    expect(status).toEqual(HttpStatus.NOT_FOUND);
    expect(food).toBeNull();
  });

  it('should rate the food', async () => {
    const { data: newRestaurant } = await restaurantController.createRestaurant(
      createRestaurantData,
    );
    const createFoodDto: CreateFoodDTO = {
      ...createFoodData,
      restaurantId: newRestaurant.id,
    };
    const requestorId = createRestaurantData.ownerId;
    const { data: newFood } = await foodController.createFood({
      requestorId,
      createFoodDto,
    });

    const { status, data: rateResult } = await foodController.rateFood({
      requestorId: requestorId,
      rateDto: { rateNumber: 5, foodId: newFood.id },
    });
    expect(status).toEqual(HttpStatus.OK);
    expect(rateResult.affected).toEqual(1);
  });

  it('should not rate the food if not authenticated', async () => {
    const { data: newRestaurant } = await restaurantController.createRestaurant(
      createRestaurantData,
    );
    const createFoodDto: CreateFoodDTO = {
      ...createFoodData,
      restaurantId: newRestaurant.id,
    };
    const requestorId = newRestaurant.ownerId;
    const { data: newFood } = await foodController.createFood({
      requestorId,
      createFoodDto,
    });

    const { status, data: rateResult } = await foodController.rateFood({
      requestorId: '',
      rateDto: { rateNumber: 5, foodId: newFood.id },
    });
    expect(status).toEqual(HttpStatus.FORBIDDEN);
    expect(rateResult).toBeNull();
  });

  it('should rate only with number between 1 to 5', async () => {
    const { data: newRestaurant } = await restaurantController.createRestaurant(
      createRestaurantData,
    );
    const createFoodDto: CreateFoodDTO = {
      ...createFoodData,
      restaurantId: newRestaurant.id,
    };
    const requestorId = newRestaurant.ownerId;
    const { data: newFood } = await foodController.createFood({
      requestorId,
      createFoodDto,
    });

    const { status: firstSatus, data: firstRateResult } =
      await foodController.rateFood({
        requestorId,
        rateDto: { rateNumber: 6, foodId: newFood.id },
      });
    expect(firstSatus).toEqual(HttpStatus.BAD_REQUEST);
    expect(firstRateResult).toBeNull();

    const { status: secondStatus, data: secondRateResult } =
      await foodController.rateFood({
        requestorId,
        rateDto: { rateNumber: -1, foodId: newFood.id },
      });
    expect(secondStatus).toEqual(HttpStatus.BAD_REQUEST);
    expect(secondRateResult).toBeNull();
  });

  it('should not rate if food does not exists', async () => {
    const { status, data } = await foodController.rateFood({
      requestorId: 'testId',
      rateDto: { rateNumber: 5, foodId: -1 },
    });
    expect(status).toEqual(HttpStatus.NOT_FOUND);
    expect(data).toBeNull();
  });
});
