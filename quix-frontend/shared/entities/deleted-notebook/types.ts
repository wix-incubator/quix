import { INotebook } from '../notebook';

export interface IDeletedNotebook extends INotebook {
  dateDeleted: number;
}
