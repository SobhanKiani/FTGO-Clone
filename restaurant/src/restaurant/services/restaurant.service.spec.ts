import { forwardRef } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodModule } from '../../food/food.module';
import { Food } from '../../food/models/food.model';
import { CreateRestaurantDTO } from '../dtos/createRestaurant.dto';
import { RateDTO } from '../dtos/rate.dto';
import { Restaurant } from '../models/restaurant.model';
import { clientProxyMock } from '../../../test/mocks/client-proxy.mock';
import { RestaurantService } from './restaurant.service';

describe('RestaurantService', () => {
  let restaurantService: RestaurantService;
  // let restaurantRepo: Repository<Restaurant>
  const createRestaurantData: CreateRestaurantDTO = {
    name: 'rest1',
    address: 'add1',
    category: 'cat1',
    ownerId: '507f1f77bcf86cd799439011',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory-rest-service:',
          dropSchema: true,
          entities: [Restaurant, Food],
          synchronize: true,
          autoLoadEntities: true,
        }),
        TypeOrmModule.forFeature([Restaurant, Food]),
        forwardRef(() => FoodModule),
      ],
      providers: [
        RestaurantService,
        {
          provide: 'NATS_SERVICE',
          useValue: clientProxyMock,
        },
      ],
    }).compile();

    restaurantService = module.get<RestaurantService>(RestaurantService);
  });

  it('should be defined', () => {
    expect(restaurantService).toBeDefined();
  });

  it('should create restaurant', async () => {
    const newRestaurant = await restaurantService.createRestaurant(
      createRestaurantData,
    );

    expect(newRestaurant.name).toEqual(createRestaurantData.name);
    expect(newRestaurant.id).toBeDefined();
    expect(newRestaurant.ownerId).toEqual(createRestaurantData.ownerId);
    // expect(restaurantRepo.create).toHaveBeenCalled()
    // expect(restaurantRepo.create).toHaveBeenCalledWith(createRestaurantData)
  });

  it('should return updated restaurant if restaurant exists', async () => {
    const newRestaurant = await restaurantService.createRestaurant(
      createRestaurantData,
    );

    const updateObj = { name: 'new name' };
    const updatedRestaurant = await restaurantService.updateRestaurant(
      newRestaurant.id,
      updateObj,
    );
    expect(updatedRestaurant.affected).toBeGreaterThan(0);

    // expect(restaurantRepo.update).toHaveBeenCalled();
    // expect(restaurantRepo.update).toHaveBeenCalledWith(1, updateObj);
  });

  it('should return null if the restaurant does not exists', async () => {
    const updateObj = { name: 'new name' };
    const updatedRestaurant = await restaurantService.updateRestaurant(
      -1,
      updateObj,
    );
    expect(updatedRestaurant.affected).toEqual(0);
    // expect(restaurantRepo.update).toHaveBeenCalled();
    // expect(restaurantRepo.update).toHaveBeenCalledWith(1, updateObj);
  });

  it('should delete existing restaurant', async () => {
    const newRestaurant = await restaurantService.createRestaurant(
      createRestaurantData,
    );
    const deletedRestaurant = await restaurantService.deleteRestaurant(
      newRestaurant.id,
    );
    // expect(restaurantRepo.delete).toHaveBeenCalled();
    // expect(restaurantRepo.delete).toHaveBeenCalledWith({ id: 1 });
    expect(deletedRestaurant.affected).toEqual(1);
  });

  it('should not delete not existing restaurant', async () => {
    const deletedRestaurant = await restaurantService.deleteRestaurant(-1);
    // expect(restaurantRepo.delete).toHaveBeenCalled();
    // expect(restaurantRepo.delete).toHaveBeenCalledWith({ id: -1 });
    expect(deletedRestaurant.affected).toEqual(0);
  });

  it('should get restaurants list', async () => {
    await restaurantService.createRestaurant(createRestaurantData);
    const resturant2 = {
      ...createRestaurantData,
      name: 'rest2',
    };
    const resturant3 = {
      ...createRestaurantData,
      name: 'rest3',
      category: 'cat3',
    };
    await restaurantService.createRestaurant(resturant2);
    await restaurantService.createRestaurant(resturant3);

    const all = await restaurantService.getRestaurants({});
    expect(all.length).toBe(3);
    expect(all[0].name).toEqual(createRestaurantData.name);

    const filterByName = await restaurantService.getRestaurants({
      name: 'rest1',
    });
    expect(filterByName.length).toBe(1);

    const filterByCat = await restaurantService.getRestaurants({
      category: 'cat1',
    });
    expect(filterByCat.length).toBe(2);

    // expect(restaurantRepo.find).toHaveBeenCalledTimes(3);
  });

  it('should rate the restaurant', async () => {
    const newRestaurant = await restaurantService.createRestaurant(
      createRestaurantData,
    );
    const rateDto: RateDTO = { restaurantId: newRestaurant.id, rateNumber: 5 };
    const rateRestuarnt = await restaurantService.rateRestaurant(rateDto);
    expect(rateRestuarnt.affected).toEqual(1);

    const updatedRestaurant = await restaurantService.getRestaurantById(
      newRestaurant.id,
    );
    expect(updatedRestaurant.rate).toEqual(5);
    expect(updatedRestaurant.rateCount).toEqual(1);
  });

  it('should rate only by numbers between 1 and 5', async () => {
    const newRestaurant = await restaurantService.createRestaurant(
      createRestaurantData,
    );
    const rateDto: RateDTO = { restaurantId: newRestaurant.id, rateNumber: 6 };
    await expect(restaurantService.rateRestaurant(rateDto)).rejects.toThrow();
  });

  it('should not rate if the restaurant does not exists', async () => {
    const rateDto: RateDTO = { restaurantId: -1, rateNumber: 5 };
    const rateRestuarnt = await restaurantService.rateRestaurant(rateDto);
    expect(rateRestuarnt).toBeNull();
  });
});
