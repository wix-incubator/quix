import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DbNote, NoteRepository} from 'entities';
import {convertDbNote, convertNoteToDb} from 'entities/dbnote.entity';
import {NoteActions, NoteActionTypes, noteReducer} from 'shared/entities/note';
import {EventBusPlugin, EventBusPluginFn} from '../infrastructure/event-bus';
import {QuixHookNames} from '../types';

@Injectable()
export class NotePlugin implements EventBusPlugin {
  name = 'note';

  constructor(
    @InjectRepository(NoteRepository)
    private noteRepository: NoteRepository,
  ) {}

  registerFn: EventBusPluginFn = api => {
    const handledEvents: string[] = Object.entries(NoteActionTypes).map(
      ([_, s]) => s,
    );
    api.setEventFilter(type => handledEvents.includes(type));
    api.hooks.listen(QuixHookNames.VALIDATION, (action: NoteActions) => {
      switch (action.type) {
        case NoteActionTypes.addNote:
        case NoteActionTypes.deleteNote:
        case NoteActionTypes.move:
        case NoteActionTypes.updateContent:
        case NoteActionTypes.updateName:
      }
    });

    api.hooks.listen(QuixHookNames.PROJECTION, async (action: NoteActions) => {
      if (action.type === NoteActionTypes.addNote) {
        const note = await noteReducer(undefined, action);
        if (note) {
          return this.noteRepository.insertNewWithRank(convertNoteToDb(note));
        }
        return;
      }
      const dbModel = await this.noteRepository.findOneOrFail(action.id);

      switch (action.type) {
        case NoteActionTypes.reorderNote: {
          return this.noteRepository.reorder(dbModel, action.to);
        }

        case NoteActionTypes.deleteNote: {
          return this.noteRepository.deleteOneAndOrderRank(dbModel);
        }

        default: {
          const model = convertDbNote(dbModel);
          const newModel = noteReducer(model, action);
          if (newModel && model !== newModel) {
            return this.noteRepository.save(convertNoteToDb(newModel));
          }
        }
      }
    });
  };
}
