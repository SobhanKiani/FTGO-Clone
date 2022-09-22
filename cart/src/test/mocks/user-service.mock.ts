import { Prisma } from "@prisma/client"

export const fakeUsers = [
    {
        id: 1,
        firstName: "Sobhan",
        lastName: "Kiani",
        cart: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 2,
        firstName: "Erfan",
        lastName: "Kiani",
        cart: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 3,
        firstName: "Ali",
        lastName: "Aliyan",
        cart: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },


]

export const userServiceMock = {
    user: {
        findUnique: jest.fn().mockImplementation((params: { where: Prisma.UserWhereUniqueInput }) => {
            const { where } = params;
            const user = fakeUsers.find((user) => user.id == where.id);
            if (!user) {
                return Promise.resolve(null);
            }
            return Promise.resolve(user);
        }),

        create: jest.fn().mockResolvedValue({ id: 4, firstName: "Skn", lastName: "1942" }),
        update: jest.fn().mockResolvedValue({ ...fakeUsers[0], firstName: "new name" })
    }
}