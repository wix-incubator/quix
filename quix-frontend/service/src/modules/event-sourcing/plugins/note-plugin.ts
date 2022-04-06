import {Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DbNote, NoteRepository, DbNotebook} from '../../../entities';
import {
  convertDbNote,
  convertNoteToDb,
} from '../../../entities/note/dbnote.entity';
import {
  IBaseNote,
  NoteActions,
  NoteActionTypes,
  noteReducer,
} from '@wix/quix-shared/entities/note';
import {EventBusPlugin, EventBusPluginFn} from '../infrastructure/event-bus';
import {QuixHookNames} from '../types';
import {IAction} from '../infrastructure/types';
import {extractEventNames, assertOwner} from './utils';
import {NotebookRepository} from '../../../entities/notebook/notebook.repository';
import {isEqual, omit} from 'lodash';

@Injectable()
export class NotePlugin implements EventBusPlugin {
  name = 'note';
  private logger = new Logger(NotePlugin.name);

  constructor(
    @InjectRepository(NoteRepository)
    private noteRepository: NoteRepository,
    @InjectRepository(NotebookRepository)
    private notebookRepository: NotebookRepository,
  ) {}

  registerFn: EventBusPluginFn = api => {
    const handledEvents: string[] = extractEventNames(NoteActionTypes);

    api.setEventFilter(type => handledEvents.includes(type));

    api.hooks.listen(
      QuixHookNames.VALIDATION,
      async (action: IAction<NoteActions>) => {
        let entity: DbNotebook | DbNote | null = null;
        switch (action.type) {
          case NoteActionTypes.addNote:
            entity = await this.notebookRepository.findOneOrFail(
              action.note.notebookId,
            );

            break;
          case NoteActionTypes.deleteNote:
          case NoteActionTypes.move:
          case NoteActionTypes.updateContent:
          case NoteActionTypes.updateName:
            entity = await this.noteRepository.findOneOrFail(action.id);
        }
        if (entity) {
          assertOwner(entity, action);
        }
      },
    );

    api.hooks.listen(
      QuixHookNames.PROJECTION,
      async (action: IAction<NoteActions>) => {
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

            if (newModel && this.modelHasChanged(action, model, newModel)) {
              return await this.noteRepository.save(convertNoteToDb(newModel), {
                reload: false,
              });
            }
          }
        }
      },
    );
  };

  modelHasChanged = (
    action: IAction<NoteActions>,
    model: IBaseNote,
    newModel: IBaseNote,
  ) => {
    switch (action.type) {
      case NoteActionTypes.updateContent: {
        const contentChanged =
          newModel.content && model.content !== newModel.content;
        const richContentChanged =
          newModel.richContent &&
          !isEqual(model.richContent, newModel.richContent);

        return contentChanged || richContentChanged;
      }

      default: {
        const valuesToOmit = ['dateUpdated', 'content', 'richContent'];
        const modelToCompare = omit(model, valuesToOmit);
        const newModelToCompare = omit(newModel, valuesToOmit);
        return !isEqual(modelToCompare, newModelToCompare);
      }
    }
  };
}
