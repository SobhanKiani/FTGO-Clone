import { User } from "@prisma/client";
import { IBaseResponse } from "../../utils/base-response.interface";

export interface ICreateUserCart extends IBaseResponse {
    data: User | null
}