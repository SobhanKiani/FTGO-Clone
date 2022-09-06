import { User } from "../models/user.model";

export interface IUpdateUserResponse {
    status: number;
    message: string;
    data: User | null;
    errors: { [key: string]: any } | null;
}