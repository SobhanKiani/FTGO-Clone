export interface IUpdateFoodEvent {
    id: number,
    data: {
        name?: string,
        category?: string,
        isAvailable?: boolean,
        price?: number;
    }
}