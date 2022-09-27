import { Cart, CartFood, Food, Prisma, User } from "@prisma/client"

export const fakeUsers: (User & { cart: { id: number } })[] = [
    {
        id: '1',
        firstName: "Sobhan",
        lastName: "Kiani",
        createdAt: new Date(),
        updatedAt: new Date(),
        cart: {
            id: 10,
        }
    },
    {
        id: '2',
        firstName: "Erfan",
        lastName: "Kiani",
        createdAt: new Date(),
        updatedAt: new Date(),
        cart: {
            id: 20,
        }
    },
    {
        id: '3',
        firstName: "Ali",
        lastName: "Aliyan",
        createdAt: new Date(),
        updatedAt: new Date(),
        cart: {
            id: 5,
        }
    },
]

export const fakeCarts: Cart[] = [
    {
        id: 10,
        userId: '1',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 20,
        userId: '2',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 5,
        userId: '3',
        createdAt: new Date(),
        updatedAt: new Date()
    }
]

export const fakeFoods: Food[] = [
    {
        id: 5,
        name: "food1",
        category: "cat1",
        isAvailable: true,
        price: 10,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 10,
        name: "food2",
        category: "cat1",
        price: 20,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 15,
        name: "food3",
        category: "cat2",
        price: 15,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
    }
]

export const fakeCartFoods: CartFood[] = [
    {
        id: 1,
        cartId: 10,
        foodId: 5,
        count: 1,
    },
    {
        id: 2,
        cartId: 5,
        foodId: 10,
        count: 1,
    }
]

export const prismaServiceMock = {
    user: {
        findUnique: jest.fn().mockImplementation((params: { where: Prisma.UserWhereUniqueInput }) => {
            const { where } = params;
            const user = fakeUsers.find((user) => user.id == where.id);
            if (!user) {
                return Promise.resolve(null);
            }
            return Promise.resolve(user);
        }),

        create: jest.fn().mockResolvedValue({ id: '4', firstName: "Skn", lastName: "1942" }),
        update: jest.fn().mockImplementation((params: { where: Prisma.UserWhereUniqueInput, data: Prisma.UserUpdateInput }) => {
            const { where, data } = params
            const foundUser = fakeUsers.find((user) => user.id === where.id);
            if (!foundUser) {
                return null;
            }
            return {
                ...foundUser,
                ...data
            }
        })
        // update: jest.fn().mockResolvedValue({ ...fakeUsers[0], firstName: "new name" })
    },

    cart: {
        upsert: jest.fn().mockImplementation((args: Prisma.CartUpsertArgs) => {
            const { where } = args;
            const foundCart = fakeCarts.find((cart) => cart.userId == where.userId);
            if (foundCart) {
                return Promise.resolve(foundCart);
            }
            const newCart: Cart = {
                id: 30,
                userId: where.userId,
                createdAt: new Date(),
                updatedAt: new Date()
            }
            fakeCarts.push(newCart);
            return Promise.resolve(newCart);
        }),

        delete: jest.fn().mockResolvedValue(fakeCarts[0]),
    },

    food: {
        create: jest.fn().mockResolvedValue({
            id: 6,
            name: "food4",
            category: "cat3",
            isAvailable: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }),
        update: jest.fn().mockImplementation(async (params: { where: Prisma.FoodWhereUniqueInput, data: Prisma.FoodUpdateInput }) => {
            const { where, data } = params

            const foundFood = fakeFoods.find((food) => food.id === where.id);
            if (!foundFood) {
                return null;
            }
            return {
                ...foundFood,
                ...data
            }
        }),

        delete: jest.fn().mockImplementation(async (args: { where: Prisma.FoodWhereUniqueInput }) => {
            const { where } = args;
            const foundFoodIndex = fakeFoods.findIndex((food) => food.id === where.id);
            if (!foundFoodIndex || foundFoodIndex === -1) {
                return null;
            }
            const foundFood = fakeFoods[foundFoodIndex]
            fakeFoods.splice(foundFoodIndex, 1)
            return {
                ...foundFood
            }
        })
    },
    cartFood: {
        create: jest.fn().mockResolvedValue({
            id: 3,
            cartId: 10,
            foodId: 10,
            count: 1,
        }),

        update: jest.fn().mockResolvedValue({
            id: 1,
            cartId: 10,
            foodId: 5,
            count: 2,
        }),

        findUnique: jest.fn().mockImplementation((params: { where: Prisma.CartFoodWhereUniqueInput }) => {
            const { where } = params
            const cartFood = fakeCartFoods.find((cartFood) => cartFood.foodId === where.foodInCart.foodId && cartFood.cartId === where.foodInCart.cartId);
            if (!cartFood) {
                return null;
            }
            return {
                ...cartFood
            }

        })
    }
}