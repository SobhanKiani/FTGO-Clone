import { User } from "../models/user.model";
import { IBaseResponseInterface } from "./base-response.interface";


export interface ISignUpResponse extends IBaseResponseInterface {
    data: { user: User, token: string } | null,
}