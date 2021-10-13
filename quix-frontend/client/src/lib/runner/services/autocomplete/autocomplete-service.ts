import { CodeEditorInstance } from '../../../code-editor';
import { ICompleterItem as AceCompletion } from '../../../code-editor/services/code-editor-completer';
// import { BiSqlWebWorkerMngr } from '../../../language-parsers/sql-parser';
// import { initSqlWorker } from '../workers/sql-parser-worker';
import {
  createMatchMask,
  getKeywordsCompletions,
  getQueryAndCursorPositionFromEditor,
  getSnippetsCompletions,
} from './autocomplete-utils';
import { IDbInfoConfig } from '../../../sql-autocomplete/db-info';
import {
  evaluateContextFromPosition,
  QueryContext,
} from '../../../sql-autocomplete/sql-context-evaluator';
import { SqlAutocompleter } from '../../../sql-autocomplete/adapter/sql-autocomplete-adapter';
import { IEditSession } from 'brace';
import { setupOldCompleter } from './old-autocomplete-service';

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

  const keywordsCompletions = getKeywordsCompletions();
  const snippetsCompletions = getSnippetsCompletions();

  const completerFn = async (prefix: string, session: IEditSession) => {
    const { query, position } = getQueryAndCursorPositionFromEditor(
      editorInstance,
      session
    );
    const queryContext: QueryContext = evaluateContextFromPosition(
      query,
      position
    );
    const contextCompletions: Promise<AceCompletion[]> = sqlAutocompleter.getCompletionItemsFromQueryContext(
      queryContext
    );

    const [keywords, snippets, completions] = await Promise.all([
      keywordsCompletions,
      snippetsCompletions,
      contextCompletions,
    ]);

    let all = [...completions, ...keywords, ...snippets];

    if (prefix) {
      const lowerCasedPrefix = prefix.trim().toLowerCase();
      all = all.reduce((resultArr: AceCompletion[], completion) => {
        const index = completion.value.toLowerCase().indexOf(lowerCasedPrefix);

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
  };

  editorInstance.addOnDemandCompleter(/[\w.]+/, completerFn as any, {
    acceptEmptyString: true,
  });

  editorInstance.addOnDemandCompleter(/[\s]+/, completerFn as any);
}
