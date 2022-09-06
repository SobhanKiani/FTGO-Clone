export interface IBaseResponseInterface {
    status: number;
    message: string;
    errors: { [key: string]: any } | null;
}