import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DbNote} from '../../../entities';
import {Repository} from 'typeorm';
import {
  noteReducer,
  NoteActions,
  NoteActionTypes,
  INote,
} from '../../../../../shared/entities/note';
import {EventBusPlugin, EventBusPluginFn} from '../infrastructure/event-bus';
import {QuixHookNames} from '../types';

@Injectable()
export class NotePlugin implements EventBusPlugin {
  name = 'notebook';

  constructor(
    @InjectRepository(DbNote)
    private noteRepository: Repository<DbNote>,
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
      const model =
        action.type === NoteActionTypes.addNote
          ? undefined
          : await this.noteRepository.findOne(action.id);

      const newModel = noteReducer(model as INote, action);

      if (newModel && model !== newModel) {
        return this.noteRepository.save(new DbNote(newModel));
      } else if (action.type === NoteActionTypes.deleteNote) {
        return this.noteRepository.delete({id: action.id});
      }
    });
  };
}
