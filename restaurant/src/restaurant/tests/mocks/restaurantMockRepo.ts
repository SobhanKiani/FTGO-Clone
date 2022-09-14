import { find } from "rxjs";
import { UpdateRestaurantDTO } from "src/restaurant/dtos/updateRestaurant.dto";
import { FilterRestaurantQuery } from "src/restaurant/queries/filter-restaurant.query";
import { DeleteResult } from "typeorm";
import { CreateRestaurantDTO } from "../../dtos/createRestaurant.dto";
import { Restaurant } from "../../models/restaurant.model";

let restaurantOne = {
    id: 1,
    name: 'rest1',
    address: 'addr1',
    category: 'cat1',
    ownerId: "507f1f77bcf86cd799439011"
}
let restaurantTwo = {
    id: 2,
    name: 'rest2',
    address: 'addr2',
    category: 'cat2',
    ownerId: "507f191e810c19729de860ea"
}
let restaurantThree = {
    id: 3,
    name: 'rest3',
    address: 'addr3',
    category: 'cat3',
    ownerId: "507f191e810c19729de860ea"
}

const restuarantsArr = [restaurantOne, restaurantTwo, restaurantThree]

export const restaurantMockRepo = {
    create: jest.fn().mockImplementation((createRestaurantDTO: CreateRestaurantDTO) => {
        const rest = new Restaurant();

        rest.id = 4;
        rest.name = createRestaurantDTO.name;
        rest.category = createRestaurantDTO.category;
        rest.address = createRestaurantDTO.address
        rest.ownerId = createRestaurantDTO.ownerId
        restuarantsArr.push({ id: rest.id, name: rest.name, category: rest.category, address: rest.address, ownerId: rest.ownerId })
        return rest;
    }),
    save: jest.fn().mockImplementation(async (restaurant: Restaurant) => {
        return await restaurant;
    }),

    update: jest.fn()
        .mockImplementation((id: number, updateRestaurantDto: UpdateRestaurantDTO) => {
            const foundRest = restuarantsArr.find((rest) => rest.id == id);
            if (!foundRest) {
                return null
            } else {
                Object.assign(foundRest, updateRestaurantDto)
                return foundRest;
            }
        }),

    findOneBy: jest.fn()
        .mockImplementation((restaurantFilter: { id: number }) => {
            const foundRest = restuarantsArr.find((rest) => rest.id == restaurantFilter.id);
            if (!foundRest) {
                return null;
            }
            return foundRest;
        }),

    delete: jest.fn()
        .mockImplementation((restaurantFilter: { id: number }) => {
            const foundRest = restuarantsArr.findIndex((rest) => rest.id == restaurantFilter.id);
            if (foundRest == -1) {
                return {
                    affected: 0,
                    raw: 0
                };
            }
            restuarantsArr.splice(foundRest, 1);
            return {
                affected: 1,
                raw: ''
            }
        }),

    find: jest.fn()
        .mockImplementation((filter: FilterRestaurantQuery) => {
            const { name, category } = filter;
            let restList = restuarantsArr;
            if (name) {
                restList = restList.filter((rest) => rest.name == name)
            }

            if (category) {
                restList = restList.filter((rest) => rest.category == category)
            }

            return restList;
        }),
    createQueryBuilder: jest.fn()
}