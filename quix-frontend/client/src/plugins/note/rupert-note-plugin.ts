import { App } from '../../lib/app';
import { flatten } from 'lodash';
import { INote, ModuleEngineType, NoteActions } from '@wix/quix-shared';
import { Store } from '../../lib/store';
import { NotePlugin} from '../../services/plugins';
import { ParamParser } from '../../lib/code-editor/services/param-parser';
import { DefaultParamSerializer } from '../../lib/code-editor/services/param-parser/param-serializers/default-param-serializer';
import { Runner } from '../../lib/runner';

const generateNoteContent = (questionId, {requestor, question, queries}) => {
  const parser = new ParamParser(new DefaultParamSerializer());
  const params = flatten(queries.map(query => query.params))
    .map(({name, type, value}) => parser.createParam(name, type, value));

  const header = `
/**************************************
Submitted by: ${requestor}
Question ID: ${questionId}
Question: ${question}
**************************************/`;

  const sql = queries.map(query => `-- ${query.title}\n${query.sql}`).join('\n\n');

  return parser.embed(`${header}\n\n${sql}`, params);
}

export class RupertNotePlugin extends NotePlugin {
  constructor(app: App, name: string, hooks: any) {
    super(app, name, hooks, {
      syntaxValidation: true,
      canCreate: false,
    });

    this.type = 'presto';

    const api = (questionId: string, path = '') => 
      `${app.getConfig().getClientTopology().apiBasePath}/api/module/rupert/question/${encodeURIComponent(questionId)}${path ? `/${path}` : ''}`;
    
    hooks.import.tapPromise('RupertNotePlugin', (store: Store, note: INote, questionId: string) => {
      if (note.type !== ModuleEngineType.Rupert) {
        return Promise.resolve();
      }

      return fetch(api(questionId))
        .then(res => res.ok ? res.json() : Promise.reject('Rupert responded with an error'))
        .then(({data})=> store.dispatchAndLog(NoteActions.updateContent(note.id, generateNoteContent(questionId, data))));
    });
    
    hooks.runFinish.tap('RupertNotePlugin', (_app: App, store: Store, note: INote, runner: Runner) => {
      if (note.type !== ModuleEngineType.Rupert) {
        return Promise.resolve();
      }

      const sql = new ParamParser(new DefaultParamSerializer()).format(note.content, [], {
        customParamsEnabled: true,
        keepEmbed: false,
      });

      const match = sql.match(/Question ID\: (\S+)/);

      if (!match) {
        return Promise.resolve();
      }

      const questionId = match[1];
      const error = runner.getState().getError();

      const headers = {
        'Content-Type': 'application/json',
      };

      const payload = {
        execution_time: Date.now() - runner.getState().getTime().started,
        failure: error ? 1 : 0,
        rows: error ? 0 : runner.getCurrentQuery().getResults().bufferSize(),
        extra_data: {
          note_id: note.id,
          note_contents: sql,
        },
      };

      return fetch(api(questionId, 'statistics'), {
        method: 'post',
        headers,
        body: JSON.stringify(payload),
      });
    });
  }
}