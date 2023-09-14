import { CodeEditorInstance } from '../../../code-editor';
// import { ICompleterItem as AceCompletion } from '../../../code-editor/services/code-editor-completer';
import { SqlAutocompleter } from "../../../sql-autocomplete/adapter/sql-autocomplete-adapter";
import {
  highlightAndScore
} from "./highlight-and-score";
// import { BiSqlWebWorkerMngr } from '../../../language-parsers/sql-parser';
// import { initSqlWorker } from '../workers/sql-parser-worker';
import {
  getKeywordsCompletions,
  getQueryAndCursorPositionFromEditor,
  getSuggestions,
  isSearchInObject,
} from './autocomplete-utils';
import { IDbInfoConfig } from '../../../sql-autocomplete/db-info';
// import { DbInfoService } from '../../../sql-autocomplete/db-info';
import {
  evaluateContextFromPosition,
  QueryContext,
} from '../../../sql-autocomplete/sql-context-evaluator';
import { IEditSession } from 'brace';
import { setupOldCompleter } from './old-autocomplete-service';

/* tslint:disable:no-shadowed-variable */
export async function setupCompleters(
  editorInstance: CodeEditorInstance,
  type: string,
  apiBasePath = '',
  dbInfoService?: IDbInfoConfig
) {
  // in order to run locally comment out
  if (!dbInfoService) {
    setupOldCompleter(editorInstance, type, apiBasePath);
    return;
  }

  // dbInfoService = dbInfoService ?? new DbInfoService(type, apiBasePath);
  const sqlAutocompleter = new SqlAutocompleter(dbInfoService, type);

  editorInstance.setLiveAutocompletion(true);

  const keywordsCompletions = getKeywordsCompletions();

  const completerFn = async (prefix: string, session: IEditSession) => {

    const { query, position } = getQueryAndCursorPositionFromEditor(
      editorInstance,
      session
    );

    const queryContext: QueryContext = evaluateContextFromPosition(
      query,
      position
    );

    const searchInObject = await isSearchInObject(queryContext, sqlAutocompleter)
    let autocompletionSuggestions = await getSuggestions(queryContext, keywordsCompletions, sqlAutocompleter, searchInObject);

    if (prefix) {
      autocompletionSuggestions = highlightAndScore(
        autocompletionSuggestions,
        queryContext,
        searchInObject
      )
    }

    return autocompletionSuggestions.sort((a, b) => a.value.localeCompare(b.value));
  };

  editorInstance.addOnDemandCompleter(/[\w.]+/, completerFn as any, {
    acceptEmptyString: true,
  });
  // editorInstance.addOnDemandCompleter(/[\s]+/, completerFn as any);
}
