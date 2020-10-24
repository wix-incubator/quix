import {INote} from 'shared';
export interface ISearch {
  search(content: string): Promise<[INote[], number]>;
}

export enum SearchTypes {
  user = 'owner',
  type = 'type',
  noteName = 'name',
  content = 'content',
}
export type SpecialSearchTypes =
  | SearchTypes.noteName
  | SearchTypes.type
  | SearchTypes.user;

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
