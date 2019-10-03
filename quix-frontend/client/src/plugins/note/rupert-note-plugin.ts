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
Question ID: ${questionId}
Submitted by: ${requestor}
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

    const baseRupertApiUrl = `${app.getConfig().getClientTopology().apiBasePath}/api/module/rupert`;
    
    hooks.import.tapPromise('RupertNotePlugin', (store: Store, note: INote, questionId: string) => {
      if (note.type !== ModuleEngineType.Rupert) {
        return Promise.resolve();
      }

      return fetch(`${baseRupertApiUrl}/question/${encodeURIComponent(questionId)}`)
        .then(res => res.ok ? res.json() : Promise.reject('Rupert responded with an error'))
        .then(({data})=> store.dispatchAndLog(NoteActions.updateContent(note.id, generateNoteContent(questionId, data))));
    });
    
    hooks.runFinish.tapPromise('RupertNotePlugin', (_app: App, store: Store, note: INote, runner: Runner) => {
      if (note.type !== ModuleEngineType.Rupert) {
        return Promise.resolve();
      }

      const questionId = 'test';
      const error = runner.getState().getError();
      const sql = new ParamParser(new DefaultParamSerializer()).format(note.content, [], {
        customParamsEnabled: true,
        keepEmbed: false,
      });

      const payload = {
        execution_time: Date.now() - runner.getState().getTime().started,
        rows: sql.split('\n').length,
        failure: error ? 1 : 0,
        failure_reason: error.msg,
        extra_data: {
          note_id: note.id,
          note_contents: sql,
        },
      };

      return fetch(`${baseRupertApiUrl}/question/${encodeURIComponent(questionId)}/statistics`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    });
  }
}