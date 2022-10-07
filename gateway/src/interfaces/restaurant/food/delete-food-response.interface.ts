import { IBaseResponse } from 'src/interfaces/base-response.interface';

export interface IDeleteFoodResponse extends IBaseResponse {
  data: { affected: number | null; raw: any } | null;
}
