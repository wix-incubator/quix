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
          // all = all.reduce((resultArr: AceCompletion[], completionItem) => {
          //     completionItem.matchMask = createMatchMask(
          //       [0],
          //       lowerCasedPrefix.length
          //     );
          //     completionItem.score = 10000 - 0;
          //     resultArr.push(completionItem);
          //   return resultArr;
          // }, []);
        }
        else  {
          all = AddHighlightAndScoreInObjectSearch(all ,queryContext , prefix );
          // all = all.reduce((resultArr: AceCompletion[], completionItem) => {
          //   const relevantPartOfPrefix = findRelevantPartOfPrefix(queryContext.tables , prefix.split('.')).slice(0, -1); //if same problem for both change in function itself
          //   const lastDotIndex = relevantPartOfPrefix.lastIndexOf('.');
          //   const startOfSearch = lastDotIndex !== -1 ? relevantPartOfPrefix.slice(0, lastDotIndex + 1) : relevantPartOfPrefix;
          //   const searchPart = relevantPartOfPrefix.replace(startOfSearch,'')
          //   const indexes = findAllIndexOf(completionItem.caption , searchPart);
          //   if (indexes.length > 0) {
          //     completionItem.matchMask = createMatchMask(
          //       indexes,
          //       searchPart.length
          //     );
          //     completionItem.score = 10000 - indexes[0];
          //     resultArr.push(completionItem);
          //   }
          //   return resultArr;
          // }, []);
        }
      }
      else  {
        all = all.filter(obj => obj.value.includes(prefix));
        all = AddHighlightAndScoreCollumSearch(all , lowerCasedPrefix)
      // all = all.reduce((resultArr: AceCompletion[], completionItem) => {
      //   const indexes = findAllIndexOf(completionItem.value, lowerCasedPrefix);

      //   if (indexes.length > 0) {
      //     completionItem.matchMask = createMatchMask(
      //       indexes,
      //       lowerCasedPrefix.length
      //     );
      //     completionItem.score = 10000 - indexes[0];
      //     resultArr.push(completionItem);
      //   }

      //   return resultArr;
      // }, []);
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



// function routeToObject(prefix:string | undefined , table : {name: string, alias: string, columns:any }) : {pathToObject: string, objectItself: string, pathInObject:string ,data?:any} { //how to test?
//   if(!prefix) {
//     return {pathToObject: "" , objectItself : "" ,pathInObject: "" };
//   }
//   const tableName = table.name.split('.');
//   const brokenPrefix = prefix.split('.');
//   let PrefixData ;
//   if (brokenPrefix.length > 0 && brokenPrefix[brokenPrefix.length - 1] === '') {
//     brokenPrefix.pop();
//   }
//   switch (brokenPrefix[0]) {
//     case tableName[0]:
//       console.log("case1")
//       PrefixData = getData(brokenPrefix[3],table);
//       if(tableName[1] === brokenPrefix[1] && tableName[2] === brokenPrefix[2] && PrefixData) {
//           return  convertToPath( brokenPrefix , 4)
//         }
//         else  {
//           return {pathToObject: "" , objectItself : "" ,pathInObject: "" };
//         }
//     case table.alias:
//       console.log("case2")
//       //PrefixData = getData(brokenPrefix[1],table);
//       console.log("PrefixData: " , PrefixData)
//       console.log("tableName[1] " , tableName[1])
//         //if(tableName[1] && PrefixData)  {
//         if(tableName[1])  {
//           console.log("in!!")
//             return convertToPath( brokenPrefix , 2 )
//         }
//         else {
//           return {pathToObject: "" , objectItself : "" ,pathInObject: "" , data:"" };
//         }
//     default:
//       console.log("case3")
//       for (const column of table.columns) {
//         if (column.name === brokenPrefix[0] && column.dataType) {
//           return {
//             pathToObject: table.name,
//             objectItself: brokenPrefix[0],
//             pathInObject: brokenPrefix.slice(1).join('.'),
//             data: column.dataType
//           };
//         }
//       }

//       break;
//   }


//   return {pathToObject: "" , objectItself : "" ,pathInObject: "" };
// }

// function convertToPath(brokenPrefix: string[], cutoff: number, data?: any): {pathToObject: string, objectItself: string, pathInObject:string, data: any} {
//   const pathToObject = brokenPrefix.slice(0, cutoff - 1).join(".");
//   const objectItself = brokenPrefix[cutoff - 1];
//   const pathInObject = brokenPrefix.slice(cutoff).join(".");
// return {
//   pathToObject,
//   objectItself,
//   pathInObject,
//   data : data
// };
// }

// }


// function getData(Column: string, table: { name: string; alias: string; columns: any; }): any {
// for (const column of table.columns) {
//   if (column.name === Column) {
//     if (column.dataType instanceof Object) {
//       return column.dataType;
//     } else {
//       return "";
//     }
//   }
// }
// return "";
// }