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
export enum searchTextType {
  PHRASE,
  WORD,
}
export interface ContentSearch {
  type: searchTextType;
  text: string;
}
export interface SearchQuery {
  [SearchTypes.content]: ContentSearch[];
  [SearchTypes.user]?: string;
  [SearchTypes.noteName]?: string;
  [SearchTypes.type]?: string;
}
