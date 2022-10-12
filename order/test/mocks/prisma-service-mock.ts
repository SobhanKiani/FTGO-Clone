import { Order } from "@prisma/client";

export const prismaServiceMock = {
    order: {
        create: jest.fn().mockResolvedValue({
            price: 20.0,
            id: 1,
            cartId: 1,
            address: "Test Addr",
            userId: '1'
        } as Order)
    }
}