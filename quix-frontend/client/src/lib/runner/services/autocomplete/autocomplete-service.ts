import { CodeEditorInstance } from '../../../code-editor';
// import { ICompleterItem as AceCompletion } from '../../../code-editor/services/code-editor-completer';
import { SqlAutocompleter } from "../../../sql-autocomplete/adapter/sql-autocomplete-adapter";
import {
  enrichCompletionItemAfterDotObject,
  enrichCompletionKeyWord,
  enrichCompletionItemColumSearch,
  enrichCompletionItemInObjectSearch
} from "./highlight-and-score";
// import { BiSqlWebWorkerMngr } from '../../../language-parsers/sql-parser';
// import { initSqlWorker } from '../workers/sql-parser-worker';
import {
  createCaption,
  getKeywordsCompletions,
  getQueryAndCursorPositionFromEditor,
} from './autocomplete-utils';
import { IDbInfoConfig } from '../../../sql-autocomplete/db-info';
// import { DbInfoService } from '../../../sql-autocomplete/db-info';
import {
  ContextType,
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
    let all;
    let searchInObject: Boolean;

    const { query, position } = getQueryAndCursorPositionFromEditor(
      editorInstance,
      session
    );

    const queryContext: QueryContext = evaluateContextFromPosition(
      query,
      position
    );

    switch (queryContext.contextType) {
      case ContextType.Undefined:
        all = keywordsCompletions;
        break;
      case ContextType.Table:
        all = await sqlAutocompleter.getCompletionItemsFromQueryContext(
          queryContext
        );
        break;
      case ContextType.Column:
        all = await sqlAutocompleter.getCompletionItemsFromQueryContext(
          queryContext
        );
        const filteredCompletions: object[] = all.filter(obj => obj.value.includes(prefix));
        searchInObject = filteredCompletions.length === 0;
        if (searchInObject) {
          all = await sqlAutocompleter.getCompletionItemsFromQueryContextColumn(
            queryContext
          );
        }
        break;
    }

    if (prefix) {
      const lowerCasedPrefix = prefix.trim().toLowerCase();
      if (queryContext.contextType === ContextType.Undefined) {
        all = enrichCompletionKeyWord(all, lowerCasedPrefix);
      } else if (searchInObject) {
        all = prefix.endsWith('.')
          ? enrichCompletionItemAfterDotObject(all)
          : enrichCompletionItemInObjectSearch(all, queryContext, lowerCasedPrefix);
      } else {
        all = enrichCompletionItemColumSearch(all, lowerCasedPrefix);
      }
    }


    all.forEach(obj => {
      obj.caption = createCaption(obj.caption || obj.value);
    });

    return all.sort((a, b) => a.value.localeCompare(b.value));
  };

  editorInstance.addOnDemandCompleter(/[\w.]+/, completerFn as any, {
    acceptEmptyString: true,
  });

  // editorInstance.addOnDemandCompleter(/[\s]+/, completerFn as any);
}
