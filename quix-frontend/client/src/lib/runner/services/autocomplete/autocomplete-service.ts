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
import { IDbInfoConfig , DbInfoService } from '../../../sql-autocomplete/db-info';
import {
  ContextType,
  evaluateContextFromPosition,
  QueryContext,
} from '../../../sql-autocomplete/sql-context-evaluator';
import { SqlAutocompleter } from '../../../sql-autocomplete/adapter/sql-autocomplete-adapter';
import { IEditSession } from 'brace';
// import { setupOldCompleter } from './old-autocomplete-service';

/* tslint:disable:no-shadowed-variable */
export async function setupCompleters(
  editorInstance: CodeEditorInstance,
  type: string,
  apiBasePath = '',
  dbInfoService?: IDbInfoConfig
) {
  // if (!dbInfoService) {
  //   setupOldCompleter(editorInstance, type, apiBasePath);
  //   return;
  // }

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
    console.log("queryContext:" , queryContext)
    const contextCompletions: Promise<AceCompletion[]> = sqlAutocompleter.getCompletionItemsFromQueryContext(
      queryContext
    );
    
    const AllContextCompletions: Promise<AceCompletion[]> = sqlAutocompleter.getAllCompletionItemsFromQueryContextCollumn(
      queryContext
    );

    const [newfunc, oldfunc] = await Promise.all([
      AllContextCompletions,
      contextCompletions,
    ]);

    const allOptions = newfunc.concat(oldfunc);

    const [keywords, completions] = await Promise.all([
      keywordsCompletions,
      allOptions,
    ]);
    console.log("completions" , completions)
    let all =
      queryContext.contextType === ContextType.Undefined
        ? keywords
        : completions;

    if (prefix) {
      const lowerCasedPrefix = prefix.trim().toLowerCase();

      all = all.reduce((resultArr: AceCompletion[], completionItem) => {
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

    all.forEach(obj => {
      if(obj.value.length>30)  {
        obj.caption="..."+obj.value.substring(obj.value.length-27,obj.value.length)
         const lowerCasedPrefix = prefix.trim().toLowerCase();
        const indexes = findAllIndexOf(obj.caption, lowerCasedPrefix);
        obj.matchMask= createMatchMask(
          indexes,
          lowerCasedPrefix.length
        );
      }
    });

    console.log("all" , all)
    return all.sort((a, b) => a.value.localeCompare(b.value));
  };

  editorInstance.addOnDemandCompleter(/[\w.]+/, completerFn as any, {
    acceptEmptyString: true,
  });

  // editorInstance.addOnDemandCompleter(/[\s]+/, completerFn as any);
}
