import { INote, ModuleEngineType, NoteActions } from '../../../../shared';
import { Store } from '../../lib/store';
import { NotePlugin} from '../../services/plugins';

const generateNoteContent = ({requestor, question, queries}) => `/**
Submitted by: ${requestor}
Question: "${question}"
*/

${queries.map(query => `-- ${query.title}
${query.sql}
`).join('\n\n')}
`

export class RupertNotePlugin extends NotePlugin {
  constructor(name: string, hooks: any) {
    super(name, hooks, {
      syntaxValidation: true,
    });
    
    hooks.import.tapPromise('RupertNotePlugin', (store: Store, note: INote, questionId) => {
      if (note.type === ModuleEngineType.Rupert) {
        return fetch(`api/module/rupert/question/${encodeURIComponent(questionId)}`)
          .then(res => res.ok ? res.json() : Promise.reject('Rupert returned an error'))
          .then(({data})=> store.dispatchAndLog(NoteActions.updateContent(note.id, generateNoteContent(data))));
      }

      return Promise.resolve();
    });
  }
}