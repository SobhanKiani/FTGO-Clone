import { User } from "../models/user.model";
import { IBaseResponseInterface } from "./base-response.interface";

export interface IMakeUserAdmin extends IBaseResponseInterface {
    data: User | null
}