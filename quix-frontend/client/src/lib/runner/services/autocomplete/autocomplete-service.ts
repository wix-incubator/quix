import {CodeEditorInstance} from '../../../code-editor';
import {ICompleterItem as AceCompletion} from '../../../code-editor/services/code-editor-completer';
import {BiSqlWebWorkerMngr} from '../../../language-parsers/sql-parser';
import {DbInfo} from '../db/db-service';
import {initSqlWorker} from '../workers/sql-parser-worker';
import {createMatchMask, makeCompletionItem} from './autocomplete-utils';

const sqlContextGroups = ['subQueries', 'tableAlias', 'strings', 'tables', 'columns'];

let sqlParser: BiSqlWebWorkerMngr;
let keywords: Promise<AceCompletion[]>; // All Completions
let tables: Promise<AceCompletion[]>;

async function getTablesCompletions(dbInfoService: DbInfo): Promise<AceCompletion[]> {
  keywords = keywords || dbInfoService.fetchAllKeywords();
  const completions = await keywords;
  return completions.filter(completion => completion.meta === 'table');
}

/* tslint:disable:no-shadowed-variable */
export async function setupCompleters(editorInstance: CodeEditorInstance, type: string, apiBasePath = '') {
  sqlParser = await initSqlWorker();
  const dbInfoService = new DbInfo(type, apiBasePath);

  keywords = keywords || dbInfoService.fetchAllKeywords();
  tables = tables || getTablesCompletions(dbInfoService);

  editorInstance.addOnDemandCompleter(/[\w.]+/, ((prefix, session) => {
    let contextCompletions: Promise<AceCompletion[]>;

    if (sqlParser) {
      const text = session.getDocument().getAllLines().join('\n');
      contextCompletions = sqlParser.parse(text)
        .then(parseResults =>
          sqlContextGroups.reduce<AceCompletion[]>((sum, groupName) =>
            sum.concat(parseResults[groupName]
              .map(item => makeCompletionItem(item, groupName))),
            []));
    } else {
      contextCompletions = Promise.resolve([]);
    }

    return Promise.all([tables, contextCompletions])
      .then(([tableCompletions, contextCompletions]) => {
        let all = contextCompletions.concat(tableCompletions);

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
