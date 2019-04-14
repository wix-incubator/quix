import {DbNote} from '../../entities';
export interface ISearch {
  search(content: string): Promise<DbNote[]>;
}
