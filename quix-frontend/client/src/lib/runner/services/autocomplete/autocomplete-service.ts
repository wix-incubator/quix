import {CodeEditorInstance} from '../../../code-editor';
import {ICompleterItem as AceCompletion} from '../../../code-editor/services/code-editor-completer';
// import {BiSqlWebWorkerMngr} from '../../../language-parsers/sql-parser';
// import {initSqlWorker} from '../workers/sql-parser-worker';
import {createMatchMask} from './autocomplete-utils';
import {IDbInfoConfig, DbInfoService} from '../../../sql-autocomplete/db-info'
import {evaluateContextFromPosition} from '../../../sql-autocomplete/sql-context-evaluator'
import {SqlAutocompleter} from '../../../sql-autocomplete/sql-autocomp-adapter/sql-autocomplete-adapter'
import { IEditSession } from 'brace';

let keywords: Promise<AceCompletion[]>; 
// let snippets: Promise<AceCompletion[]>; 

// async function getKeywordsCompletions(dbInfoService: DbInfo): Promise<AceCompletion[]> {
//   keywords = keywords || dbInfoService.fetchAllKeywords();
//   const completions = await keywords;
//   return completions.filter(completion => completion.meta === 'table');
// }

/* tslint:disable:no-shadowed-variable */
export async function setupCompleters(editorInstance: CodeEditorInstance, type: string, apiBasePath = '') {
  const dbInfoService: IDbInfoConfig  = new DbInfoService(type, apiBasePath);
  const sqlAutocompleter = new SqlAutocompleter(dbInfoService, evaluateContextFromPosition);

  editorInstance.addOnDemandCompleter(/[\w.]+/, ((prefix: string, session: IEditSession) => {
    const query = session.getDocument().getAllLines().join('\n');
    const position = session.getDocument().positionToIndex(session.selection.getCursor(), 0);
    // TODO: Check if it works and maybe think about something smarter
    
    const contextCompletions: AceCompletion[] = sqlAutocompleter.getCompleters(query, position);
    
    return Promise.all([keywords, contextCompletions])
      .then(([keywords, contextCompletions]) => {
        let all = keywords.concat(contextCompletions);

        if (prefix) {
          all = all.reduce((resultArr: AceCompletion[], completion) => {
            const index = completion.value.indexOf(prefix);

            if (index !== -1) {
              completion.matchMask = createMatchMask(index, prefix.length);
              resultArr.push(completion);
            }

            return resultArr;
          }, []);
        }
        return all;
      });
  }) as any, {acceptEmptyString: true});
}
