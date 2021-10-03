import { CodeEditorInstance } from '../../../code-editor';
import { ICompleterItem as AceCompletion } from '../../../code-editor/services/code-editor-completer';
// import { BiSqlWebWorkerMngr } from '../../../language-parsers/sql-parser';
// import { initSqlWorker } from '../workers/sql-parser-worker';
import { createMatchMask, makeCompletionItem } from './autocomplete-utils';
import { IDbInfoConfig } from '../../../sql-autocomplete/db-info';
import {
  evaluateContextFromPosition,
  QueryContext,
} from '../../../sql-autocomplete/sql-context-evaluator';
import { reservedPrestoWords } from '../../../sql-autocomplete/languge/reserved-words';
import { SqlAutocompleter } from '../../../sql-autocomplete/adapter/sql-autocomplete-adapter';
import { IEditSession } from 'brace';
import { setupOldCompleter } from './old-autocomplete-service';

let keywords: AceCompletion[];
let snippets: AceCompletion[];

function getKeywordsCompletions(): AceCompletion[] {
  // TODO: FIND A WAY TO FETCH KEYWORDS FROM ANTLR GRAMMAR
  keywords =
    keywords ??
    reservedPrestoWords.map((keyword) =>
      makeCompletionItem(keyword, 'keyword')
    );
  return keywords;
}

function getSnippetsCompletions(): AceCompletion[] {
  snippets =
    snippets ??
    [
      [
        'SELECT * FROM table_name WHERE column_name > 10 ORDER BY column_name',
        'Simple Query',
      ],
      ['WITH table_name AS (SELECT * FROM table_name)', 'With Query'],
    ].map(([snippet, caption]) =>
      makeCompletionItem(
        snippet,
        'snippet',
        caption !== '' ? caption : undefined
      )
    );
  return snippets;
}

/* tslint:disable:no-shadowed-variable */
export async function setupCompleters(
  editorInstance: CodeEditorInstance,
  type: string,
  apiBasePath = '',
  dbInfoService?: IDbInfoConfig
) {
  if (!dbInfoService) {
    setupOldCompleter(editorInstance, type, apiBasePath);
    return;
  }

  // dbInfoService = dbInfoService ?? new DbInfoService(type, apiBasePath);
  const sqlAutocompleter = new SqlAutocompleter(dbInfoService);

  editorInstance.setLiveAutocompletion(true);

  const keywords = getKeywordsCompletions();
  const snippets = getSnippetsCompletions();

  editorInstance.addOnDemandCompleter(
    /[\w.]+/,
    ((prefix: string, session: IEditSession) => {
      
      let rawQuery = session
        .getDocument()
        .getAllLines()
        .join('\n');
      const rawPosition = session
        .getDocument()
        .positionToIndex(session.selection.getCursor(), 0);

      rawQuery =
        rawQuery.slice(0, rawPosition) + '@REPLACE_ME@' + rawQuery.slice(rawPosition);

      rawQuery = editorInstance.getParams().format(rawQuery);
      const position = rawQuery.indexOf('@REPLACE_ME@');
      const query = rawQuery.replace('@REPLACE_ME@', '');

      const queryContext: QueryContext = evaluateContextFromPosition(
        query,
        position
      );
      const contextCompletions: Promise<AceCompletion[]> = sqlAutocompleter.getCompletionItemsFromQueryContext(
        queryContext
      );

      return Promise.all([keywords, snippets, contextCompletions]).then(
        ([keywords, snippets, contextCompletions]) => {
          let all = [...contextCompletions, ...keywords, ...snippets];

          if (prefix) {
            const lowerCasedPrefix = prefix.toLowerCase();
            all = all.reduce((resultArr: AceCompletion[], completion) => {
              const index = completion.value
                .toLowerCase()
                .indexOf(lowerCasedPrefix);

              if (index !== -1) {
                completion.matchMask = createMatchMask(
                  index,
                  lowerCasedPrefix.length
                );
                resultArr.push(completion);
              }

              return resultArr;
            }, []);
          }

          return all.sort((a, b) => a.matchMask?.length - b.matchMask?.length);
        }
      );
    }) as any,
    { acceptEmptyString: true }
  );
}
