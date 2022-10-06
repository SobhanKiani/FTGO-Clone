import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateRestaurantDTO } from 'src/dto/restaurant/createRestaurant.dto';
import { Restaurant } from '../../models/restaurant.model';
import { RestaurantService } from '../../services/restaurant/restaurant.service';
import { CreateFoodDTO } from '../../dto/food/create-food.dto';
import { RateDTO } from '../../dto/food/rate.dto';
import { Food } from '../../models/food.model';
import { FoodService } from './food.service';
import { clientProxyMock } from '../../../test/mocks/client-proxy.mock';

describe('FoodService', () => {
  let foodService: FoodService;
  let restaurantService: RestaurantService;
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
          database: ':memory-food-service:',
          dropSchema: true,
          entities: [Restaurant, Food],
          synchronize: true,
          autoLoadEntities: true,
        }),
        TypeOrmModule.forFeature([Food, Restaurant]),
      ],
      providers: [
        FoodService,
        RestaurantService,
        {
          provide: 'NATS_SERVICE',
          useValue: clientProxyMock,
        },
      ],
    }).compile();

    foodService = module.get<FoodService>(FoodService);
    restaurantService = module.get<RestaurantService>(RestaurantService);
  });

  it('should be defined', () => {
    expect(foodService).toBeDefined();
    expect(restaurantService).toBeDefined();
  });

  it('should create food for existing restaurant', async () => {
    const newRestauarnt = await restaurantService.createRestaurant(
      createRestaurantData,
    );
    const createFoodDto: CreateFoodDTO = {
      ...createFoodData,
      restaurantId: newRestauarnt.id,
    };
    const newFood = await foodService.createFood(createFoodDto, newRestauarnt);

    expect(newFood.id).toBeDefined();
    expect(newFood.name).toEqual(createFoodData.name);
    expect(newFood.restaurant.id).toEqual(newRestauarnt.id);
  });

  it('should get food by id if food exists', async () => {
    const newRestauarnt = await restaurantService.createRestaurant(
      createRestaurantData,
    );
    const createFoodDto: CreateFoodDTO = {
      ...createFoodData,
      restaurantId: newRestauarnt.id,
    };
    const newFood = await foodService.createFood(createFoodDto, newRestauarnt);

    const food = await foodService.getFoodById(newFood.id);

    expect(food).toBeDefined();
    expect(food).not.toBeNull();
    expect(food.name).toEqual(newFood.name);
  });

  it('should return null if food does not exists', async () => {
    const food = await foodService.getFoodById(-1);
    expect(food).toBeNull();
  });

  it('should update existing food', async () => {
    const newRestauarnt = await restaurantService.createRestaurant(
      createRestaurantData,
    );
    const createFoodDto: CreateFoodDTO = {
      ...createFoodData,
      restaurantId: newRestauarnt.id,
    };
    const newFood = await foodService.createFood(createFoodDto, newRestauarnt);

    const updateData = { name: 'new food name' };

    const updateResult = await foodService.updateFood(newFood.id, updateData);
    expect(updateResult.affected).toEqual(1);
  });

  it('should not update a food that does not exist', async () => {
    const updateData = { name: 'new food name' };

    const updateResult = await foodService.updateFood(-1, updateData);
    expect(updateResult.affected).toEqual(0);
  });

  it('should delete existing food', async () => {
    const newRestauarnt = await restaurantService.createRestaurant(
      createRestaurantData,
    );
    const createFoodDto: CreateFoodDTO = {
      ...createFoodData,
      restaurantId: newRestauarnt.id,
    };
    const newFood = await foodService.createFood(createFoodDto, newRestauarnt);

    const deleteResult = await foodService.deleteFood(newFood.id);
    expect(deleteResult.affected).toEqual(1);

    const deletedFood = await foodService.getFoodById(newFood.id);
    expect(deletedFood).toBeNull();
  });

  it('should get food list', async () => {
    const newRestauarnt = await restaurantService.createRestaurant(
      createRestaurantData,
    );
    const createFoodDto: CreateFoodDTO = {
      ...createFoodData,
      restaurantId: newRestauarnt.id,
    };
    const newFood = await foodService.createFood(createFoodDto, newRestauarnt);

    const foodList = await foodService.getFoodList({});
    expect(foodList).toHaveLength(1);

    const filteredFoodList = await foodService.getFoodList({
      name: newFood.name,
    });
    expect(filteredFoodList).toHaveLength(1);

    const notExisitedFilteredFoodList = await foodService.getFoodList({
      name: 'not exist',
    });
    expect(notExisitedFilteredFoodList.length).toEqual(0);
  });

  it('should rate the food', async () => {
    const newRestauarnt = await restaurantService.createRestaurant(
      createRestaurantData,
    );
    const createFoodDto: CreateFoodDTO = {
      ...createFoodData,
      restaurantId: newRestauarnt.id,
    };
    const newFood = await foodService.createFood(createFoodDto, newRestauarnt);
    const rateDto: RateDTO = { foodId: newFood.id, rateNumber: 5 };
    const rateFood = await foodService.rateFood(rateDto);
    expect(rateFood.affected).toEqual(1);

    const updatedFood = await foodService.getFoodById(newFood.id);
    expect(updatedFood.rate).toEqual(5);
    expect(updatedFood.rateCount).toEqual(1);
  });

  it('should rate only by numbers between 1 and 5', async () => {
    const newRestauarnt = await restaurantService.createRestaurant(
      createRestaurantData,
    );
    const createFoodDto: CreateFoodDTO = {
      ...createFoodData,
      restaurantId: newRestauarnt.id,
    };
    const newFood = await foodService.createFood(createFoodDto, newRestauarnt);
    const rateDto: RateDTO = { foodId: newFood.id, rateNumber: 6 };
    await expect(foodService.rateFood(rateDto)).rejects.toThrowError();
  });

  it('should not rate if the food does not exists', async () => {
    const rateDto: RateDTO = { foodId: -1, rateNumber: 5 };
    const rateRestuarnt = await foodService.rateFood(rateDto);
    expect(rateRestuarnt).toBeNull();
  });
});
