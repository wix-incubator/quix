import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DbNotebook, DbFolder, DbFileTreeNode} from '../../../entities';
import {Repository} from 'typeorm';
import {FileActions, FileActionTypes} from 'shared/entities/file';
import {NotebookActions, NotebookActionTypes} from 'shared/entities/notebook';
import {EventBusPlugin, EventBusPluginFn} from '../infrastructure/event-bus';
import {QuixHookNames} from '../types';
import {last} from 'lodash';
import {FileType} from 'shared/entities/file';
import uuid from 'uuid/v4';
import {FileTreeRepository} from 'entities/filenode.repository';

@Injectable()
export class FileTreePlugin implements EventBusPlugin {
  name = 'fileTree';

  constructor(
    @InjectRepository(DbFolder)
    private folderRepo: Repository<DbFolder>,
    private fileTreeNodeRepo: FileTreeRepository,
  ) {}

  registerFn: EventBusPluginFn = api => {
    const handledEvents: string[] = Object.entries<string>(FileActionTypes)
      .concat(Object.entries(NotebookActionTypes))
      .map(([_, s]) => s);

    api.setEventFilter(type => handledEvents.includes(type));

    api.hooks.listen(
      QuixHookNames.VALIDATION,
      async (action: FileActions | NotebookActions, hookApi) => {
        switch (action.type) {
          case FileActionTypes.createFile: {
            const {file} = action;
            if (file.type === FileType.notebook) {
              throw new Error('Notebooks should be created directly');
            }
          }
          case FileActionTypes.deleteFile: {
            const node = await this.fileTreeNodeRepo.findOne(action.id);
            if (node && node.type === FileType.notebook) {
              throw new Error('Notebooks should be deleted directly');
            }
          }
          default:
        }
      },
    );

    api.hooks.listen(
      QuixHookNames.PROJECTION,
      async (action: FileActions | NotebookActions) => {
        switch (action.type) {
          case FileActionTypes.createFile: {
            const {file} = action;
            const parent = last(file.path);
            const node = new DbFileTreeNode();
            node.id = file.id;
            node.owner = (action as any).user;
            node.parent = parent ? new DbFileTreeNode(parent.id) : undefined;
            const folder = new DbFolder();
            folder.id = file.id;
            folder.owner = (action as any).user;
            folder.name = file.name;
            node.folder = folder;
            return this.fileTreeNodeRepo.save(node);
          }
          case FileActionTypes.updateName: {
            const {id} = action;
            const folder = await this.folderRepo.findOne(id, {
              loadRelationIds: true,
            });
            if (folder) {
              folder.name = action.name;
              return this.folderRepo.save(folder);
            }
            throw new Error(`Can't find folder`);
          }

          case FileActionTypes.toggleIsLiked: {
            // const {id} = action;
            // const folder = await this.folderRepo.findOne(id);
            // if (folder) {
            //   folder.isLiked = action.isLiked;
            //   return this.folderRepo.save(folder);
            // }
            // throw new Error(`Can't find folder`);
          }

          case FileActionTypes.deleteFile: {
            return this.fileTreeNodeRepo.delete({id: action.id});
          }
        }
      },
    );
  };
}
