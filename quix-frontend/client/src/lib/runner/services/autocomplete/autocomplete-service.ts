import { CodeEditorInstance } from '../../../code-editor';
import { ICompleterItem as AceCompletion } from '../../../code-editor/services/code-editor-completer';
// import { BiSqlWebWorkerMngr } from '../../../language-parsers/sql-parser';
// import { initSqlWorker } from '../workers/sql-parser-worker';
import {
  createMatchMask,
  findAllIndexOf,
  getKeywordsCompletions,
  getQueryAndCursorPositionFromEditor,
} from './autocomplete-utils';
import { IDbInfoConfig } from '../../../sql-autocomplete/db-info';
import {
  ContextType,
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
  const sqlAutocompleter = new SqlAutocompleter(dbInfoService, type);

  editorInstance.setLiveAutocompletion(true);

  const completerFn = async (prefix: string, session: IEditSession) => {
    const { query, position } = getQueryAndCursorPositionFromEditor(
      editorInstance,
      session
    );

    const queryContext: QueryContext = evaluateContextFromPosition(
      query,
      position
    );

    const sortByValueLexicographicOrder = (
      a: AceCompletion,
      b: AceCompletion
    ) => a.value.localeCompare(b.value);

    let completions: AceCompletion[];

    switch (queryContext.contextType) {
      case ContextType.Keywords:
        completions = getKeywordsCompletions();
        break;
      case ContextType.Undefined:
        const keywordsCompletions = getKeywordsCompletions();
        const contextCompletions: Promise<AceCompletion[]> = sqlAutocompleter.getCompletionItemsFromQueryContext(
          queryContext
        );
        const [keywords, entityCompletions] = await Promise.all([
          keywordsCompletions,
          contextCompletions,
        ]);
        completions = [
          ...entityCompletions.sort(sortByValueLexicographicOrder),
          ...keywords.sort(sortByValueLexicographicOrder),
        ];
        break;
      default:
        completions = await sqlAutocompleter.getCompletionItemsFromQueryContext(
          queryContext
        );
    }

    if (prefix) {
      const lowerCasedPrefix = prefix.trim().toLowerCase();

      completions = completions.reduce((resultArr: AceCompletion[], completionItem) => {
        const indexes = findAllIndexOf(completionItem.value, lowerCasedPrefix);

        if (indexes.length > 0) {
          completionItem.matchMask = createMatchMask(
            indexes,
            lowerCasedPrefix.length
          );
          completionItem.score = 10000 - indexes[0];
          resultArr.push(completionItem);
        }

        return resultArr;
      }, []);
    }

    return queryContext.contextType === ContextType.Undefined
      ? completions
      : completions.sort(sortByValueLexicographicOrder);
  };

  editorInstance.addOnDemandCompleter(/[\w.]+/, completerFn as any, {
    acceptEmptyString: true,
  });

  // editorInstance.addOnDemandCompleter(/[\s]+/, completerFn as any);
}
