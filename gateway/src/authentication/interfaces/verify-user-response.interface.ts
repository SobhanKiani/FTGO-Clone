import { User } from "../models/user.model";
import { IBaseResponseInterface } from "./base-response.interface";

export interface IVerifyUserResponse extends IBaseResponseInterface {
    data: User | null
}