import {
  SearchQuery,
  SearchTypes,
  searchTextType,
  SpeciaSearchTypes,
} from './types';

const createRegExAtBeginingOrEnd = (regex: string | RegExp): RegExp[] => {
  const source = regex instanceof RegExp ? regex.source : regex;
  return [new RegExp('^' + source + ' '), new RegExp(source + '$')];
};

const searchRegexMap = {
  [SearchTypes.user]: createRegExAtBeginingOrEnd(/user:([(\w@\.-_)]*)/),
  [SearchTypes.type]: createRegExAtBeginingOrEnd(/type:(\w*)/),
  [SearchTypes.noteName]: [
    ...createRegExAtBeginingOrEnd(/name:([\w-_\.]*)/),
    ...createRegExAtBeginingOrEnd(/name:"([\w-_\. ]*)"/),
  ],
  [SearchTypes.content]: [/(?:([^\s"]+)|"(.+)")/g],
};

export const parse = (s: string): SearchQuery => {
  s = s.trim();
  const [parialQuery, updatedString] = getSpecialOperators(s);
  const query: SearchQuery = {
    ...parialQuery,
    [SearchTypes.content]: getTextFromSearchQuery(updatedString),
  };

  return query;
};

const getSpecialOperators = (
  s: string,
  operators: SpeciaSearchTypes[] = [
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
        /* do anohter iteration, to handle other operators */
        const [parialQuery, updatedString] = getSpecialOperators(
          s,
          operators.filter(name => name !== operator),
        );
        s = updatedString;
        Object.assign(query, parialQuery);
        return true;
      }
      return false;
    }),
  );

  return [query, s];
};

const fullTextSearchSpeciaChars = /[+\-><\(\)~*\/"@]+/g;
const getTextFromSearchQuery = (s: string) => {
  const result = [];
  let match = null;

  /* tslint:disable-next-line */
  while ((match = searchRegexMap[SearchTypes.content][0].exec(s))) {
    result.push(
      match[1]
        ? {
            type: searchTextType.WORD,
            text: match[1].replace(fullTextSearchSpeciaChars, ' ').trim(),
          }
        : {
            type: searchTextType.PHRASE,
            text: match[2].replace(fullTextSearchSpeciaChars, ' ').trim(),
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
