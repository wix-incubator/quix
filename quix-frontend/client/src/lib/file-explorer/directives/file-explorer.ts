import {assign, isArray} from 'lodash';
import {createNgModel, initNgScope, inject} from '../../core';
import {IItemDef} from '../services';
import {File, Folder} from '../services/file-explorer-models';
import {treeToDef, defToTree} from '../services/file-explorer-tools';
import Controller from '../services/file-explorer-controller';
import VM from './file-explorer-vm';

import template from './file-explorer.html';
import './file-explorer.scss';

function directive(params) {
  return assign({
    template,
    restrict: 'E'
  }, params);
}

function initScope(scope, controller: Controller, depth: number) {
  scope.depth = depth;

  const helper = initNgScope(scope)
    .readonly(scope.readonly)
    .withOptions('feOptions', {
      fileAlias: 'file',
      orderBy: 'name', // name|dateCreated|dateUpdated
      orderReversed: false,
      expandAllFolders: false,
      hideEmptyFolders: false,
      actions: {
        folder: {
          createFile: false
        }
      },
      settings: false
    }, ({orderBy, orderReversed, fileAlias}) => {
      scope.options.fileAlias = isArray(fileAlias) ? fileAlias : [fileAlias];
      scope.vm.order.setField(orderBy, orderReversed);
    })
    .withVM(VM)
    .withEditableEvents({
      onFolderDelete(folder: Folder) {
        folder.destroy();

        if (folder.getParent().isEmpty()) {
          folder.getParent().toggleOpen(false);
        }

        controller.syncItem(folder, 'folderDeleted');
      },
      onFolderRename(folder: Folder) {
        scope.vm.folder.toggleEdit(folder, true);
      },
      onFolderRenamed(folder: Folder) {
        controller.syncItem(folder, 'folderRenamed');
      }
    })
    .withEvents({
      onItemDrop(_, __, folder: Folder) {
        scope.vm.dropped.item.moveTo(folder);

        if (scope.vm.dropped.item instanceof File) {
          controller.syncItem(scope.vm.dropped.item, 'fileMoved');
        } else {
          controller.syncItem(scope.vm.dropped.item, 'folderMoved');
        }
      },
      onFolderDragStart(_, __, folder: Folder) {
        // scope.vm.folder.toggleOpen(folder, false);
      },
      onFolderBlur(folder: Folder) {
        scope.vm.folder.toggleEdit(folder, false);
      },
      onFolderClick(folder: Folder) {
        if (!scope.vm.folders.get(folder).edit.enabled) {
          scope.vm.folder.toggleOpen(folder);
          scope.vm.folder.setCurrent(folder);

          if (folder.isLazy() && scope.vm.folder.isOpen(folder)) {
            const promise = controller.openLazyFolder(folder);

            if (promise && promise.then) {
              promise.then(() => folder.setLazy(false));
            }
          }
        }
      },
      onFileClick(file: File) {
        scope.vm.file.setCurrent(file);
        controller.clickFile(file);
      },
      onSettingsClick(folder: Folder) {
        controller.fireEvent(folder, 'settingsClicked');
      }
    });

    if (!scope.readonly || scope.options.actions.folder.createFile) {
      helper.withEvents({
        onFileCreate(type = scope.options.fileAlias[0], folder?: Folder) {
          const file = (folder || scope.model).toggleOpen(true).createFile(`New ${type}`, type);
          controller.syncItem(file, 'fileCreated', type);
        }
      });
    }

    if (depth < 2) {
      helper.withEditableEvents({
        onFolderCreate(folder?: Folder) {
          folder = (folder || scope.model).toggleOpen(true);

          inject('$timeout')(() => {
            folder = folder
              .createFolder('New folder')
              .toggleEdit(true);

            controller.syncItem(folder, 'folderCreated');
          });
        }
      });
    }
}

export function fileExplorerInner() {
  return directive({
    require: '^biFileExplorer',
    scope: {
      model: '=',
      feOptions: '<',
      readonly: '='
    },

    link: {
      pre: (scope, element, attrs, controller) => {
        scope.$watch('model', model => scope.vm.init({controller, item: scope.model, options: scope.options}));

        initScope(scope, controller, element.parents('bi-file-explorer-inner').length as number + 1);
      }
    }
  });
}

export function fileExplorer() {
  return directive({
    require: ['ngModel', 'biFileExplorer'],
    transclude: true,
    controller: ['$scope', '$element', '$transclude', Controller],
    scope: {
      feOptions: '<',
      onLazyFolderOpen: '&',
      onFileClick: '&',
      onLoad: '&',
      getFolderPermissions: '&',
      emptyText: '@',
      readonly: '='
    },
    link: {
      pre: (scope, element, attrs, [ngModel, controller]: [ng.INgModelController, Controller]) => {
        createNgModel(scope, ngModel)
          .formatWith((model: IItemDef[]) => defToTree(model))
          .parseWith((model: Folder) => treeToDef(model))
          .renderWith((model: Folder) => {
            scope.vm.init({controller, item: model, options: scope.options});
          })
          .then(() => {
            scope.onLoad({fileExplorer: controller.getInstance()});
          })
          .feedBack(false);

        scope.container = element;
        initScope(scope, controller, 0);
      }
    }
  });
}

