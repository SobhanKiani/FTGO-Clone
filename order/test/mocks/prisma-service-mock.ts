import { Order } from "@prisma/client";

export const orderData = {
    id: 1,
    price: 20.0,
    cartId: 1,
    address: "Test Addr",
    userId: '1',
    userFullName: "Sobhan Kiani",
    phoneNumber: "+989136421265",
    foods: [
        { name: "food1", count: 2 },
        { name: "food2", count: 1 }
    ]
} as Order & { foods }

export const prismaServiceMock = {
    order: {
        create: jest.fn().mockResolvedValue(orderData)
    }
}