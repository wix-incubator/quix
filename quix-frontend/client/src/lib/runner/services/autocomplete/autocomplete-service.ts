import { CodeEditorInstance } from '../../../code-editor';
import { ICompleterItem as AceCompletion } from '../../../code-editor/services/code-editor-completer';
import { SqlAutocompleter } from "../../../sql-autocomplete/adapter/sql-autocomplete-adapter";
import { 
  AddHighlightAndScoreAfterDotObject, 
  filterAndAddHighlightAndForKeyWord,
  AddHighlightAndScoreCollumSearch,
  AddHighlightAndScoreInObjectSearch
} from "./highLightAndScore";
// import { BiSqlWebWorkerMngr } from '../../../language-parsers/sql-parser';
// import { initSqlWorker } from '../workers/sql-parser-worker';
import {
  getKeywordsCompletions,
  getQueryAndCursorPositionFromEditor,
} from './autocomplete-utils';
import { IDbInfoConfig, DbInfoService } from '../../../sql-autocomplete/db-info';
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
  if (!dbInfoService) {
    setupOldCompleter(editorInstance, type, apiBasePath); // in order to run locally comment out
    return;
  }

  dbInfoService = dbInfoService ?? new DbInfoService(type, apiBasePath);
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
    console.log("1.0")

    let contextCompletions: Promise<AceCompletion[]> = sqlAutocompleter.getCompletionItemsFromQueryContext(
      queryContext
    );

    console.log("2.0")


    const filteredCompletions: object[] = (await contextCompletions).filter(obj => obj.value.includes(prefix));

    if (filteredCompletions.length === 0) {
      contextCompletions = sqlAutocompleter.getAllCompletionItemsFromQueryContextCollumn(
        queryContext
      );
    }

    const [keywords, completions] = await Promise.all([
      keywordsCompletions,
      contextCompletions,
    ]);

    let all =
      queryContext.contextType === ContextType.Undefined
        ? keywords
        : completions;
        
    if (prefix) {
      const lowerCasedPrefix = prefix.trim().toLowerCase();
      if (filteredCompletions.length === 0) {
        if (prefix.endsWith('.')) {
          all = AddHighlightAndScoreAfterDotObject(all, [0], "");
        }
        else {
          queryContext.contextType === ContextType.Undefined
        ? all = filterAndAddHighlightAndForKeyWord(all , lowerCasedPrefix)
        : all = AddHighlightAndScoreInObjectSearch(all, queryContext, lowerCasedPrefix);
        }
      }
      else {
        all = all.filter(obj => obj.value.includes(prefix));
        all = AddHighlightAndScoreCollumSearch(all, lowerCasedPrefix)
      }
    }

    all.forEach(obj => {
      if (obj.caption?.length > 60) {
        obj.caption = obj.caption.substring(0, 57) + "..."
      }
      if (!obj.caption && obj.value.length > 60) {
        obj.caption = obj.value.substring(0, 57) + "..."
      }
    });
    console.log("all1:" , all)
    return all.sort((a, b) => a.value.localeCompare(b.value));
  };

  editorInstance.addOnDemandCompleter(/[\w.]+/, completerFn as any, {
    acceptEmptyString: true,
  });

  // editorInstance.addOnDemandCompleter(/[\s]+/, completerFn as any);
}