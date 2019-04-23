import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DbNote, NoteRepository} from 'entities';
import {Repository} from 'typeorm';
import {
  noteReducer,
  NoteActions,
  NoteActionTypes,
  INote,
} from 'shared/entities/note';
import {EventBusPlugin, EventBusPluginFn} from '../infrastructure/event-bus';
import {QuixHookNames} from '../types';

@Injectable()
export class NotePlugin implements EventBusPlugin {
  name = 'notebook';

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
          return this.noteRepository.insertNewWithRank(new DbNote(note));
        }
        return;
      }

      const model = await this.noteRepository.findOneOrFail(action.id);

      switch (action.type) {
        case NoteActionTypes.reorderNote: {
          return this.noteRepository.reorder(model, action.to);
        }

        case NoteActionTypes.deleteNote: {
          return this.noteRepository.deleteOneAndOrderRank(model);
        }

        default: {
          const newModel = noteReducer(model as INote, action);
          if (newModel && model !== newModel) {
            return this.noteRepository.save(new DbNote(newModel));
          }
        }
      }
    });
  };
}
