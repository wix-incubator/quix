import {DbNote} from '../../entities';
export interface ISearch {
  search(content: string): Promise<DbNote[]>;
}

export enum SearchTypes {
  user = 'owner',
  type = 'type',
  noteName = 'name',
  content = 'content',
}

export interface SearchQuery {
  [SearchTypes.content]: string[];
  [SearchTypes.user]?: string;
  [SearchTypes.noteName]?: string;
  [SearchTypes.type]?: string;
}
