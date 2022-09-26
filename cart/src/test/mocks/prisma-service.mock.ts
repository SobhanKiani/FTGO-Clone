import { Cart, Food, Prisma, User } from "@prisma/client"
import { CartService } from "src/services/cart/cart.service";

export const fakeUsers: User[] = [
    {
        id: '1',
        firstName: "Sobhan",
        lastName: "Kiani",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: '2',
        firstName: "Erfan",
        lastName: "Kiani",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: '3',
        firstName: "Ali",
        lastName: "Aliyan",
        createdAt: new Date(),
        updatedAt: new Date()
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
    }
]

export const fakeFoods: Food[] = [
    {
        id: 5,
        name: "food1",
        category: "cat1",
        isAvailable: true,
        price:10,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 10,
        name: "food2",
        category: "cat1",
        price:20,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 15,
        name: "food3",
        category: "cat2",
        price:15,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
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
        })
    }
}