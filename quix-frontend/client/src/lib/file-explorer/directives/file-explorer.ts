import {assign, isArray} from 'lodash';
import {createNgModel, initNgScope, inject, utils} from '../../core';
import {confirm, toast} from '../../ui';
import {IItemDef} from '../services';
import {File, Folder} from '../services/file-explorer-models';
import {treeToDef, defToTree, addFile} from '../services/file-explorer-tools';
import Controller from '../services/file-explorer-controller';
import VM from './file-explorer-vm';

import templateDynamic from './file-explorer-dynamic.html';
import templateStatic from './file-explorer-static.html';

import './file-explorer.scss';

type Mode = 'static' | 'dynamic';

const confirmAction = (action: 'delete', context: 'folder', name: string) => {
  return confirm({
    title: `${action} ${context}`,
    actionType: action === 'delete' ? 'destroy' : 'neutral',
    yes: action,
    icon: 'report',
    html: `<div>Are you sure you want to delete the ${utils.dom.escape(context)} <b>"${utils.dom.escape(name)}"</b> ?</div>`
  });
}

function directive(mode: Mode, params) {
  return assign({
    template: mode === 'dynamic' ? templateDynamic : templateStatic,
    restrict: 'E'
  }, params);
}

function initScope(scope, controller: Controller, depth: number, mode: Mode) {
  scope.depth = depth;
  scope.renderFolder = (s) => controller.renderFolder(s);
  scope.renderFile = (s) => controller.renderFile(s);
  scope.renderFolderIcon = (folder) => controller.renderFolderIcon(scope, folder);
  scope.renderFileIcon = (file) => controller.renderFileIcon(scope, file);
  scope.renderMenu = (s, folder) => controller.renderMenu(s, folder);

  const helper = initNgScope(scope)
    .readonly(scope.readonly)
    .withOptions('feOptions', {
      fileAlias: 'file',
      orderBy: 'name', // name|dateCreated|dateUpdated
      orderReversed: false,
      expandRootFolder: false,
      expandAllFolders: false,
      hideEmptyFolders: false,
      folderMode: 'expand', // expand|select 
      draggable: false
    }, ({orderBy, orderReversed, fileAlias}) => {
      scope.options.fileAlias = isArray(fileAlias) ? fileAlias : [fileAlias];
      scope.vm.order.setField(orderBy, orderReversed);
    })
    .withVM(VM)
    .withEditableEvents({
      onFileCreate(type = scope.options.fileAlias[0], folder?: Folder) {
        const file = (folder || scope.model).toggleOpen(true).createFile(`New ${type}`, type);
        controller.syncItem(file, 'fileCreated', type);
      },
      onFolderDelete(folder: Folder) {
        const fn = () => {
          folder.destroy();

          if (folder.getParent().isEmpty()) {
            folder.getParent().toggleOpen(false);
          }
  
          controller.syncItem(folder, 'folderDeleted');

          toast.showToast({
            text: `Deleted folder "${folder.getName()}"`,
            type: 'success'
          }, 3000);
        };

        if (folder.isEmpty()) {
          fn();
        } else {
          confirmAction('delete', 'folder', folder.getName()).then(fn);
        }
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
        const {item}: {item: File | Folder} =  scope.vm.dropped;

        if (item instanceof File && !folder.getFileById(item.getId())) {
          item.moveTo(folder);
          controller.syncItem(item, 'fileMoved');
        } else if (
          item instanceof Folder
          && folder.getId() !== item.getId()
          && !folder.getFolderById(item.getId())
          && !folder.getParentById(item.getId())
          && folder.getDepth() + item.getLength() <= 3
        ) {
          item.moveTo(folder);
          controller.syncItem(item, 'folderMoved');
        }
      },
      onDrag(item: Folder | File) {
        return item.getName();
      },
      onFolderBlur(folder: Folder) {
        scope.vm.folder.toggleEdit(folder, false);
      },
      onFolderToggle(folder: Folder) {
        if (scope.vm.folders.get(folder).edit.enabled) {
          return;
        }

        scope.vm.folder.toggleOpen(folder);

        if (scope.vm.folder.isOpen(folder)) {
          folder.setLimit(20);

          if (folder.isLazy()) {
            controller.fetchLazyFolder(folder).then(items => {
              items.forEach(item => addFile(folder, item));
              folder.setLazy(false);

              inject('$timeout')(() => folder.setLimit(null), 100);
            });
          } else {
            inject('$timeout')(() => folder.setLimit(null), 100);
          }
        }
      },
      onFolderClick(folder: Folder) {
        if (scope.options.folderMode === 'select') {
          scope.vm.folder.setCurrent(folder);
          scope.vm.file.setCurrent(null);
          controller.clickFolder(folder);
        } else {
          scope.events.onFolderToggle(folder);
        }
      },
      onFileClick(file: File) {
        if (scope.options.folderMode === 'select') {
          scope.vm.file.setCurrent(file);
          scope.vm.folder.setCurrent(null);
          controller.clickFile(file);
        }
      }
    });

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

const fileExplorerInnerBuilder = (mode: Mode) => () => {
  return directive(mode, {
    require: `^biFileExplorer${mode === 'static' ? 'Static' : ''}`,
    scope: {
      model: '=',
      feOptions: '<',
      readonly: '='
    },

    link: {
      pre: (scope, element, attrs, controller) => {
        scope.$watch('model', model => scope.vm.init({
          controller,
          item: scope.model,
          options: scope.options
        }));

        initScope(
          scope,
          controller,
          element.parents(`bi-file-explorer-inner${mode === 'static' ? '-static' : ''}`).length as number + 1,
          mode
        );
      }
    }
  });
}

const fileExplorerBuilder = (mode: Mode) => () => {
  return directive(mode, {
    require: ['ngModel', `biFileExplorer${mode === 'static' ? 'Static' : ''}`],
    transclude: {
      folderIcon: '?folderIcon',
      fileIcon: '?fileIcon',
      menu: '?menu'
    },
    controller: ['$scope', '$element', '$transclude', Controller],
    scope: {
      feOptions: '<',
      onLazyFolderFetch: '&',
      onFileClick: '&',
      onFolderClick: '&',
      onLoad: '&',
      permissions: '&',
      emptyText: '@',
      readonly: '='
    },
    link: {
      pre: (scope, element, attrs, [ngModel, controller]: [ng.INgModelController, Controller]) => {
        createNgModel(scope, ngModel)
          .formatWith((model: IItemDef[]) => defToTree(model, scope.options))
          .parseWith((model: Folder) => treeToDef(model))
          .renderWith((model: Folder) => {
            scope.vm.init({
              controller,
              item: model,
              options: scope.options,
              isRoot: true
            });
          })
          .then(() => {
            if (scope.options.expandRootFolder && scope.model.getFolders().length === 1) {
              scope.model.getFolders()[0].toggleOpen(true);
            }

            scope.onLoad({fileExplorer: controller.getInstance()});
          })
          .feedBack(false);

        initScope(scope, controller, 0, mode);

        element.addClass(`fe-folder-mode-${scope.options.folderMode}`);
      }
    }
  });
}

export const fileExplorer = fileExplorerBuilder('dynamic');
export const fileExplorerStatic = fileExplorerBuilder('static');
export const fileExplorerInner = fileExplorerInnerBuilder('dynamic');
export const fileExplorerInnerStatic = fileExplorerInnerBuilder('static');
