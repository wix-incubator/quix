import {INote} from '../entities/note/types';

export enum SearchTypes {
  user = "owner",
  type = "type",
  noteName = "name",
  content = "content",
}

export type SpecialSearchTypes =
  | SearchTypes.noteName
  | SearchTypes.type
  | SearchTypes.user;

export enum SearchTextType {
  PHRASE,
  WORD,
}

export interface ContentSearch {
  type: SearchTextType;
  text: string;
}

export interface SearchQuery {
  fullText: string;
  [SearchTypes.content]: ContentSearch[];
  [SearchTypes.user]?: string;
  [SearchTypes.noteName]?: string;
  [SearchTypes.type]?: string;
}

export interface SearchResult {
  notes: INote[];
  count: number;
  term: SearchQuery;
};
