import { CodeEditorInstance } from '../../../code-editor';
import { ICompleterItem as AceCompletion } from '../../../code-editor/services/code-editor-completer';
import { findRelevantPartOfPrefix ,SqlAutocompleter } from "../../../sql-autocomplete/adapter/sql-autocomplete-adapter";
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
// import { SqlAutocompleter } from '../../../sql-autocomplete/adapter/sql-autocomplete-adapter';
import { IEditSession } from 'brace';
// import { table } from 'console';
// import { setupOldCompleter } from './old-autocomplete-service';

/* tslint:disable:no-shadowed-variable */
export async function setupCompleters(
  editorInstance: CodeEditorInstance,
  type: string,
  apiBasePath = '',
  dbInfoService?: IDbInfoConfig
) {
  // if (!dbInfoService) {
  //   setupOldCompleter(editorInstance, type, apiBasePath); // in order to run locally comment out
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

    let contextCompletions: Promise<AceCompletion[]> = sqlAutocompleter.getCompletionItemsFromQueryContext(
      queryContext
    );
    const completions2 = contextCompletions;
    const filteredCompletions : object[] =  (await completions2).filter(obj => obj.value.includes(queryContext.prefix));
    if(filteredCompletions.length === 0) {
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
      if(filteredCompletions.length === 0) {
        if(prefix.endsWith('.'))  {
          all = all.reduce((resultArr: AceCompletion[], completionItem) => {
              completionItem.matchMask = createMatchMask(
                [0],
                lowerCasedPrefix.length
              );
              completionItem.score = 10000 - 0;
              resultArr.push(completionItem);
            return resultArr;
          }, []);
        }
        else  {
          all = all.reduce((resultArr: AceCompletion[], completionItem) => {
            const relevantPartOfPrefix = findRelevantPartOfPrefix(queryContext.tables , prefix.split('.')).slice(0, -1); //if same problem for both change in function itself
            const lastDotIndex = relevantPartOfPrefix.lastIndexOf('.');
            const startOfSearch = lastDotIndex !== -1 ? relevantPartOfPrefix.slice(0, lastDotIndex + 1) : relevantPartOfPrefix;
            const searchPart = relevantPartOfPrefix.replace(startOfSearch,'')
            console.log("completionItem.caption" , completionItem.caption)
            console.log("searchPart" , searchPart)
            console.log("!!!!!!!!!!!!!" , searchPart)
            const indexes = findAllIndexOf(completionItem.caption , searchPart);
            console.log("indexes.length : " , indexes.length)
            if (indexes.length > 0) {
              completionItem.matchMask = createMatchMask(
                indexes,
                searchPart.length
              );
              completionItem.score = 10000 - indexes[0];
              resultArr.push(completionItem);
            }
            console.log("completionItem" , completionItem)
            console.log("resultArr" , resultArr)
            return resultArr;
          }, []);
          console.log("all!@#$%%:" , all)
        }
      }
      else  {
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
    }

    console.log("all2:" , all)

    // all.forEach(obj => {
    //   if(obj.caption.length>30)  {
    //     obj.caption=obj.value.substring(0,28) + "..."
    //     if(prefix) {
    //       const lowerCasedPrefix = prefix.trim().toLowerCase();
    //       const indexes = findAllIndexOf(obj.caption, lowerCasedPrefix);
    //       console.log("indexes:" , indexes)
    //       obj.matchMask= createMatchMask(
    //       indexes,
    //       lowerCasedPrefix.length
    //     );
    //     }
    //   }
    // });

    console.log("all3:" , all)
    return all.sort((a, b) => a.value.localeCompare(b.value));
  };

  editorInstance.addOnDemandCompleter(/[\w.]+/, completerFn as any, {
    acceptEmptyString: true,
  });

  // editorInstance.addOnDemandCompleter(/[\s]+/, completerFn as any);
}
