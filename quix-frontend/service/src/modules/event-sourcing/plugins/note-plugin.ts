import {Injectable, ConsoleLogger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DbNote, NoteRepository, DbNotebook} from '../../../entities';
import {
  convertDbNote,
  convertNoteToDb,
} from '../../../entities/note/dbnote.entity';
import {
  NoteActions,
  NoteActionTypes,
  noteReducer,
} from '@wix/quix-shared/entities/note';
import {EventBusPlugin, EventBusPluginFn} from '../infrastructure/event-bus';
import {QuixHookNames} from '../types';
import {IAction} from '../infrastructure/types';
import {extractEventNames, assertOwner} from './utils';
import {NotebookRepository} from '../../../entities/notebook/notebook.repository';

@Injectable()
export class NotePlugin implements EventBusPlugin {
  name = 'note';
  private logger = new ConsoleLogger(NotePlugin.name);

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
              {where: {id: action.note.notebookId}},
            );

            break;
          case NoteActionTypes.deleteNote:
          case NoteActionTypes.move:
          case NoteActionTypes.updateContent:
          case NoteActionTypes.updateName:
            entity = await this.noteRepository.findOneOrFail({where: {id: action.id}});
        }
        if (entity) {
          assertOwner(entity, action);
        }
      },
    );

    api.hooks.listen(
      QuixHookNames.PROJECTION,
      async (action: IAction<NoteActions>) => {
        let _model, _dbModel, _newModel;

        try {
          if (action.type === NoteActionTypes.addNote) {
            const note = await noteReducer(undefined, action);
            if (note) {
              return this.noteRepository.insertNewWithRank(
                convertNoteToDb(note),
              );
            }
            return;
          }
          const dbModel = await this.noteRepository.findOneOrFail({where: { id: action.id}});
          _dbModel = dbModel;

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
              _model = model;
              _newModel = newModel;
              if (newModel && model !== newModel) {
                return this.noteRepository.save(convertNoteToDb(newModel), {
                  reload: false,
                });
              }
            }
          }
        } catch (e) {
          this.log(action, e, _model, _dbModel, _newModel);
          throw e;
        }
      },
    );
  };

  log = (
    action: any,
    e: any,
    model: any = undefined,
    dbModel: any = undefined,
    newModel: any = undefined,
  ) => {
    const msg = `
    +===*Test*===+

    Action: ${JSON.stringify(action)}
    +========+
    Error: ${e}
    +========+
    Model: ${JSON.stringify(model)}
    +========+
    DbModel: ${JSON.stringify(dbModel)}
    +========+
    NewModel: ${JSON.stringify(newModel)}

    +===*Test*===+
    `;

    console.log(msg);
    console.error(msg);
    this.logger.error(msg);
  };
}
