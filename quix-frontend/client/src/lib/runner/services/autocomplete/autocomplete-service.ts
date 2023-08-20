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
    const filteredCompletions : object[] =  (await contextCompletions).filter(obj => obj.value.includes(prefix));
    
    if( filteredCompletions.length === 0 ) {
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
           all = AddHighlightAndScoreAfterDotObject(all,[0],lowerCasedPrefix);
        }
        else  {
          all = AddHighlightAndScoreInObjectSearch(all ,queryContext , prefix );
        }
      }
      else  {
        all = all.filter(obj => obj.value.includes(prefix));
        all = AddHighlightAndScoreCollumSearch(all , lowerCasedPrefix)
    }
    }

    all.forEach(obj => {
      if(obj.caption?.length>30)  {
        obj.caption=obj.caption.substring(0,28) + "..."
      }
      if(!obj.caption && obj.value.length>30)  {
        obj.caption=obj.value.substring(0,28) + "..."
      }        
    });

    return all.sort((a, b) => a.value.localeCompare(b.value));
  };

  editorInstance.addOnDemandCompleter(/[\w.]+/, completerFn as any, {
    acceptEmptyString: true,
  });

  // editorInstance.addOnDemandCompleter(/[\s]+/, completerFn as any);
}
function AddHighlightAndScoreAfterDotObject(all: AceCompletion[], indexes: number[], lowerCasedPrefix: string): AceCompletion[] {
  all = all.reduce((resultArr: AceCompletion[], completionItem) => {
    completionItem.matchMask = createMatchMask(
      indexes,
      lowerCasedPrefix.length
    );
    completionItem.score = 10000 - 0;
    resultArr.push(completionItem);
  return resultArr;
}, []);
return all;
}
function AddHighlightAndScoreInObjectSearch(all: AceCompletion[], queryContext: any, prefix: string): AceCompletion[] {
  all.reduce((resultArr: AceCompletion[], completionItem) => {
    const relevantPartOfPrefix = findRelevantPartOfPrefix(queryContext.tables , prefix.split('.')).slice(0, -1); //if same problem for both change in function itself
    const lastDotIndex = relevantPartOfPrefix.lastIndexOf('.');
    const startOfSearch = lastDotIndex !== -1 ? relevantPartOfPrefix.slice(0, lastDotIndex + 1) : relevantPartOfPrefix;
    const searchPart = relevantPartOfPrefix.replace(startOfSearch,'')
    const indexes = findAllIndexOf(completionItem.caption , searchPart);
    if (indexes.length > 0) {
      completionItem.matchMask = createMatchMask(
        indexes,
        searchPart.length
      );
      completionItem.score = 10000 - indexes[0];
      resultArr.push(completionItem);
    }
    return resultArr;
  }, []);
return all;
}
function AddHighlightAndScoreCollumSearch(all: AceCompletion[] , lowerCasedPrefix : string): AceCompletion[] {
  all.reduce((resultArr: AceCompletion[], completionItem) => {
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
return all;
}