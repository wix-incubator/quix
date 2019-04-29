import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DbFolder, DbFileTreeNode} from '../../../entities';
import {Repository} from 'typeorm';
import {FileActions, FileActionTypes} from 'shared/entities/file';
import {NotebookActions, NotebookActionTypes} from 'shared/entities/notebook';
import {EventBusPlugin, EventBusPluginFn} from '../infrastructure/event-bus';
import {QuixHookNames} from '../types';
import {last} from 'lodash';
import {FileType} from 'shared/entities/file';
import {FileTreeRepository} from 'entities/filenode.repository';

@Injectable()
export class FileTreePlugin implements EventBusPlugin {
  name = 'fileTree';

  constructor(
    @InjectRepository(DbFolder)
    private folderRepo: Repository<DbFolder>,
    @InjectRepository(FileTreeRepository)
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
            break;
          }
          case FileActionTypes.deleteFile: {
            const node = await this.fileTreeNodeRepo.findOneOrFail(action.id);
            if (node && node.type === FileType.notebook) {
              throw new Error('Notebooks should be deleted directly');
            } else {
              hookApi.context.set({fileNode: node});
            }
            break;
          }
          case FileActionTypes.moveFile: {
            const node = await this.fileTreeNodeRepo.findOneOrFail(action.id);
            if (node.type === FileType.notebook) {
              throw new Error('Notebooks should be moved directly');
            } else {
              hookApi.context.set({fileNode: node});
            }
            break;
          }
          default:
        }
      },
    );

    api.hooks.listen(
      QuixHookNames.PROJECTION,
      async (action: FileActions | NotebookActions, hookApi) => {
        switch (action.type) {
          case FileActionTypes.createFile: {
            const {file} = action;
            const parent = last(file.path);
            const folder = new DbFolder();

            Object.assign(folder, {
              id: file.id,
              owner: (action as any).user,
              name: file.name,
            });
            const node = new DbFileTreeNode();

            Object.assign(node, {
              id: file.id,
              owner: (action as any).user,
              parent: parent ? new DbFileTreeNode(parent.id) : undefined,
              folder,
            });

            return this.fileTreeNodeRepo.save(node);
          }

          case FileActionTypes.updateName: {
            const {id} = action;
            const folder = await this.folderRepo.findOneOrFail(id, {
              loadRelationIds: true,
            });

            folder.name = action.name;
            return this.folderRepo.save(folder);
          }

          case NotebookActionTypes.moveNotebook: {
            const {id, path} = action;
            const node = new DbFileTreeNode(id, {parentId: path.id});
            return this.fileTreeNodeRepo.save(node);
          }

          case FileActionTypes.moveFile: {
            const {id, path} = action;
            const newParent = await this.fileTreeNodeRepo.findOneOrFail(
              path.id,
            );
            const fileNode: DbFileTreeNode = hookApi.context.get().fileNode;
            return this.fileTreeNodeRepo.moveTree(fileNode, newParent);
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
            debugger;
            const fileNode: DbFileTreeNode = hookApi.context.get().fileNode;
            return this.fileTreeNodeRepo.deleteTree(fileNode);
          }
        }
      },
    );
  };
}
