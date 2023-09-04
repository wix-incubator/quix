import { CodeEditorInstance } from '../../../code-editor';
import { ICompleterItem as AceCompletion } from '../../../code-editor/services/code-editor-completer';
import { SqlAutocompleter } from "../../../sql-autocomplete/adapter/sql-autocomplete-adapter";
import {
  enrichCompletionItemAfterDotObject,
  enrichCompletionKeyWord,
  enrichCompletionItemColumSearch,
  enrichCompletionItemInObjectSearch
} from "./highlight -and-score";
// import { BiSqlWebWorkerMngr } from '../../../language-parsers/sql-parser';
// import { initSqlWorker } from '../workers/sql-parser-worker';
import {
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
    let nestedColumnCompletions;
    let all;

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

    const [keywords, completions] = await Promise.all([
      keywordsCompletions,
      contextCompletions
    ]);

    const filteredCompletions: object[] = completions.filter(obj => obj.value.includes(prefix));
    const searchInObject: Boolean = filteredCompletions.length === 0;
    if (searchInObject) {
      nestedColumnCompletions = sqlAutocompleter.getCompletionItemsFromQueryContextColumn(
        queryContext
      );
      [nestedColumnCompletions] = await Promise.all([nestedColumnCompletions]);
    }

    if (searchInObject && nestedColumnCompletions) {
      all = queryContext.contextType === ContextType.Undefined ? keywords : nestedColumnCompletions;
    } else {
      all = completions;
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
        const filterCompletions = all.filter(obj => obj.value.includes(prefix));
        all = enrichCompletionItemColumSearch(filterCompletions, lowerCasedPrefix);
      }
    }


    all.forEach(obj => {
      const maxCaptionLength = 60;
      const maxDisplayLength = 57;
      if (obj.caption?.length > maxCaptionLength) {
        obj.caption = obj.caption.substring(0, maxDisplayLength) + "..."
      }
      if (!obj.caption && obj.value.length > maxCaptionLength) {
        obj.caption = obj.value.substring(0, maxDisplayLength) + "..."
      }
    });
    return all.sort((a, b) => a.value.localeCompare(b.value));
  };

  editorInstance.addOnDemandCompleter(/[\w.]+/, completerFn as any, {
    acceptEmptyString: true,
  });

  // editorInstance.addOnDemandCompleter(/[\s]+/, completerFn as any);
}
