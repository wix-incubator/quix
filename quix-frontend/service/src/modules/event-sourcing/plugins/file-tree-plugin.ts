import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DbFolder, DbFileTreeNode} from '../../../entities';
import {Repository} from 'typeorm';
import {FileActions, FileActionTypes, IFile} from 'shared/entities/file';
import {NotebookActions, NotebookActionTypes} from 'shared/entities/notebook';
import {EventBusPlugin, EventBusPluginFn} from '../infrastructure/event-bus';
import {QuixHookNames} from '../types';
import {last} from 'lodash';
import {FileType} from 'shared/entities/file';
import {FileTreeRepository} from 'entities/filenode/filenode.repository';
import {IAction} from '../infrastructure/types';
import {
  extractEventNames,
  assertOwner,
  lastAndAssertExist,
  assert,
} from './utils';
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
    const handledEvents: string[] = extractEventNames(
      FileActionTypes,
      NotebookActionTypes,
    );

    api.setEventFilter(type => handledEvents.includes(type));

    api.hooks.listen(
      QuixHookNames.VALIDATION,
      async (action: IAction<FileActions | NotebookActions>, hookApi) => {
        switch (action.type) {
          case FileActionTypes.createFile: {
            const {file} = action;

            assertNodeNotNotebook(
              file,
              action,
              'Notebooks should be created directly',
            );

            const parentPath = last(file.path);
            const parent = parentPath
              ? await this.fileTreeNodeRepo.findOneOrFail({id: parentPath.id})
              : undefined;

            if (parent) {
              assertOwner(
                parent,
                action,
                `Can't add folder, parent folder owner is a different user`,
              );
            }

            hookApi.context.set({parent});
            break;
          }

          case FileActionTypes.deleteFile: {
            const node = await this.fileTreeNodeRepo.findOneOrFail(action.id);
            assertOwner(node, action);
            assertNodeNotNotebook(
              node,
              action,
              'Notebooks should be deleted directly',
            );

            hookApi.context.set({fileNode: node});
            break;
          }

          case FileActionTypes.moveFile: {
            const node = await this.fileTreeNodeRepo.findOneOrFail(action.id);
            assertOwner(node, action);
            assertNodeNotNotebook(
              node,
              action,
              'Notebooks should be moved directly',
            );
            hookApi.context.set({fileNode: node});
            break;
          }
          default:
        }
      },
    );

    api.hooks.listen(
      QuixHookNames.PROJECTION,
      async (action: IAction<FileActions | NotebookActions>, hookApi) => {
        switch (action.type) {
          case FileActionTypes.createFile: {
            const {file} = action;
            const parent: DbFileTreeNode | undefined = hookApi.context.get()
              .parent;
            const folder = new DbFolder();

            Object.assign(folder, {
              id: file.id,
              owner: action.user,
              name: file.name,
            });
            const node = new DbFileTreeNode();

            Object.assign(node, {
              id: file.id,
              owner: action.user,
              parent,
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
            const parent = lastAndAssertExist(path, action);

            const node = new DbFileTreeNode(id, {parentId: parent.id});
            return this.fileTreeNodeRepo.save(node);
          }

          case FileActionTypes.moveFile: {
            const {id, path} = action;
            const parent = lastAndAssertExist(path, action);
            const parentNode = await this.fileTreeNodeRepo.findOneOrFail(
              parent.id,
            );
            const fileNode: DbFileTreeNode = hookApi.context.get().fileNode;
            return this.fileTreeNodeRepo.moveTree(fileNode, parentNode);
          }

          case FileActionTypes.toggleIsLiked:
            break;

          case FileActionTypes.deleteFile: {
            const fileNode: DbFileTreeNode = hookApi.context.get().fileNode;
            return this.fileTreeNodeRepo.deleteTree(fileNode);
          }
        }
      },
    );
  };
}

function assertNodeNotNotebook(
  node: DbFileTreeNode | IFile,
  action: IAction,
  msg: string,
) {
  assert(node, action, ({type}) => type !== FileType.notebook, msg);
}
