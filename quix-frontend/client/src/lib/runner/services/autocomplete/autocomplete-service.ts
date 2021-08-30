import { CodeEditorInstance } from '../../../code-editor';
import { ICompleterItem as AceCompletion } from '../../../code-editor/services/code-editor-completer';
// import {BiSqlWebWorkerMngr} from '../../../language-parsers/sql-parser';
// import {initSqlWorker} from '../workers/sql-parser-worker';
import { createMatchMask, makeCompletionItem } from './autocomplete-utils';
import {
  IDbInfoConfig,
  DbInfoService,
} from '../../../sql-autocomplete/db-info';
import {
  evaluateContextFromPosition,
  QueryContext,
} from '../../../sql-autocomplete/sql-context-evaluator';
import { reservedPrestoWords } from '../../../sql-autocomplete/languge/reserved-words';
import { SqlAutocompleter } from '../../../sql-autocomplete/adapter/sql-autocomplete-adapter';
import { IEditSession } from 'brace';

let keywords: Promise<AceCompletion[]>;
let snippets: Promise<AceCompletion[]>;

async function getKeywordsCompletions(): Promise<AceCompletion[]> {
  return reservedPrestoWords.map((keyword) =>
    makeCompletionItem(keyword, 'keyword')
  );
}

async function getSnippetsCompletions(): Promise<AceCompletion[]> {
  return [
    'SELECT * FROM table_name WHERE column_name > 10 ORDER BY column_name',
  ].map((snippet) => makeCompletionItem(snippet, 'snippet'));
}

/* tslint:disable:no-shadowed-variable */
export async function setupCompleters(
  editorInstance: CodeEditorInstance,
  type: string,
  apiBasePath = ''
) {
  const dbInfoService: IDbInfoConfig = new DbInfoService(type, apiBasePath);
  const sqlAutocompleter = new SqlAutocompleter(dbInfoService);

  keywords = getKeywordsCompletions();
  snippets = getSnippetsCompletions();

  editorInstance.addOnDemandCompleter(
    /[\w.]+/,
    ((prefix: string, session: IEditSession) => {
      const query = session
        .getDocument()
        .getAllLines()
        .join('\n');
      const position = session
        .getDocument()
        .positionToIndex(session.selection.getCursor(), 0);

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
            const lowerCasedprefix = prefix.toLowerCase();
            all = all.reduce((resultArr: AceCompletion[], completion) => {
              const index = completion.value
                .toLowerCase()
                .indexOf(lowerCasedprefix);

              if (index !== -1) {
                completion.matchMask = createMatchMask(
                  index,
                  lowerCasedprefix.length
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
