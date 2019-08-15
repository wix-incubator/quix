import { flatten } from 'lodash';
import { INote, ModuleEngineType, NoteActions } from '../../../../shared';
import { Store } from '../../lib/store';
import { NotePlugin} from '../../services/plugins';
import { ParamParser } from '../../lib/code-editor/services/param-parser';
import { DefaultParamSerializer } from '../../lib/code-editor/services/param-parser/param-serializers/default-param-serializer';

const generateNoteContent = ({requestor, question, queries}) => {
  const parser = new ParamParser(new DefaultParamSerializer());
  const params = flatten(queries.map(query => query.params))
    .map(({name, type, value}) => parser.createParam(name, type, value));

  const header = `
/**************************************
Submitted by: ${requestor}
Question: ${question}
**************************************/`;

  const sql = queries.map(query => `-- ${query.title}\n${query.sql}`).join('\n\n');

  return parser.embed(`${header}\n\n${sql}`, params);
}

export class RupertNotePlugin extends NotePlugin {
  constructor(name: string, hooks: any) {
    super(name, hooks, {
      syntaxValidation: true,
    });
    
    hooks.import.tapPromise('RupertNotePlugin', (store: Store, note: INote, questionId: string) => {
      if (note.type === ModuleEngineType.Rupert) {
        return fetch(`api/module/rupert/question/${encodeURIComponent(questionId)}`)
          .then(res => res.ok ? res.json() : Promise.reject('Rupert returned an error'))
          .then(({data})=> store.dispatchAndLog(NoteActions.updateContent(note.id, generateNoteContent(data))));
      }

      return Promise.resolve();
    });
  }
}