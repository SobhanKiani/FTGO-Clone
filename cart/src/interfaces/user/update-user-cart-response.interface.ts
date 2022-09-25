import { User } from "@prisma/client";
import { IBaseResponse } from "../base-response.interface";

export interface IUpdateUserCart extends IBaseResponse {
    data: User | null;
}