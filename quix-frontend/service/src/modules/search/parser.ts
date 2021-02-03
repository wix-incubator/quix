import {
  SearchQuery,
  SearchTypes,
  searchTextType,
  SpecialSearchTypes,
} from './types';

const createRegExAtBeginningOrEnd = (regex: string | RegExp): RegExp[] => {
  const source = regex instanceof RegExp ? regex.source : regex;
  return [new RegExp('^' + source + ' '), new RegExp(source + '$')];
};

const searchRegexMap = {
  [SearchTypes.user]: createRegExAtBeginningOrEnd(/user:([(\w@\.-_)]*)/),
  [SearchTypes.type]: createRegExAtBeginningOrEnd(/type:(\w*)/),
  [SearchTypes.noteName]: [
    ...createRegExAtBeginningOrEnd(/name:([\w-_\.]*)/),
    ...createRegExAtBeginningOrEnd(/name:"([\w-_\. ]*)"/),
  ],
  [SearchTypes.content]: [/(?:([^\s"]+)|"(.+)")/g],
};

export const parse = (s: string): SearchQuery => {
  s = s.trim();
  const [partialQuery, updatedString] = getSpecialOperators(s);
  const query: SearchQuery = {
    ...partialQuery,
    [SearchTypes.content]: getTextFromSearchQuery(updatedString),
  };

  return query;
};

const getSpecialOperators = (
  s: string,
  operators: SpecialSearchTypes[] = [
    SearchTypes.noteName,
    SearchTypes.type,
    SearchTypes.user,
  ],
): [Partial<SearchQuery>, string] => {
  const query: Partial<SearchQuery> = {};

  operators.some(operator =>
    searchRegexMap[operator].some(regex => {
      const match = regex.exec(s);

      if (match && match[1]) {
        const f = match[1];
        query[operator] = match[1];
        s = s.replace(match[0], '');
        /* do another iteration, to handle other operators */
        const [partialQuery, updatedString] = getSpecialOperators(
          s,
          operators.filter(name => name !== operator),
        );
        s = updatedString;
        Object.assign(query, partialQuery);
        return true;
      }
      return false;
    }),
  );

  return [query, s];
};

const fullTextSearchSpecialChars = /[+\-><\(\)~*\/"@]+/g;
const getTextFromSearchQuery = (s: string) => {
  const result = [];
  let match = null;

  /* tslint:disable-next-line */
  while ((match = searchRegexMap[SearchTypes.content][0].exec(s))) {
    result.push(
      match[1]
        ? {
            type: searchTextType.WORD,
            text: match[1].replace(fullTextSearchSpecialChars, ' ').trim(),
          }
        : {
            type: searchTextType.PHRASE,
            text: match[2].replace(fullTextSearchSpecialChars, ' ').trim(),
          },
    );
  }
  return result;
};

export const isValidQuery = (query: SearchQuery) =>
  query[SearchTypes.content].length > 0 ||
  query[SearchTypes.noteName] ||
  query[SearchTypes.type] ||
  query[SearchTypes.user];
