import {assign, defaults} from 'lodash';
import {inject} from '../../core';
import {Item, File, Folder} from './file-explorer-models';
import {itemToDef} from './file-explorer-tools';
import Instance from './file-explorer-instance';

interface Permissions {
  rename: boolean;
  delete: boolean;
}

export default class Controller {
  private readonly ngModel: ng.INgModelController;
  private readonly $compile: ng.ICompileService;
  private readonly instance: Instance;
  private currentFolder: Folder = null;
  private currentFile: File = null;

  constructor(private readonly $scope, private readonly $element, private readonly $transclude :ng.ITranscludeFunction) {
    this.instance = new Instance($scope);
    this.ngModel = $element.controller('ngModel');
    this.$compile = inject('$compile');
  }

  private render(html) {
    return scope => ({html: this.$compile(html)(scope)});
  }

  getInstance(): Instance {
    return this.instance;
  }

  getPermissions(folder): Permissions {
    return defaults({}, this.$scope.permissions({folder: itemToDef(folder)}), {
      rename: !this.$scope.readonly,
      delete: !this.$scope.readonly,
      menu: !this.$scope.readonly
    });
  }

  getContainer() {
    return this.$element;
  }

  setCurrentFolder(folder: Folder): Controller {
    this.currentFolder = folder;
    return this;
  }

  setCurrentFile(file: File): Controller {
    this.currentFile = file;
    return this;
  }

  getCurrentFolder(): Folder {
    return this.currentFolder;
  }

  getCurrentFile(): File {
    return this.currentFile;
  }

  fireEvent(item: Item, eventName: string, ...args): Controller {
    this.instance.trigger(eventName, itemToDef(item), ...args);

    return this;
  }

  syncItem(item: Item, eventName: string, ...args): Controller {
    this.ngModel.$setViewValue(this.$scope.model.$clone());

    this.fireEvent(item, eventName, ...args);

    return this;
  }

  clickFile(file: File): Controller {
    this.$scope.onFileClick({file: itemToDef(file)});
    return this;
  }

  clickFolder(folder: Folder): Controller {
    this.$scope.onFolderClick({folder: itemToDef(folder)});
    return this;
  }

  fetchLazyFolder(folder: Folder) {
    return this.$scope.onLazyFolderFetch({folder: itemToDef(folder)});
  }

  transclude(element, file) {
    this.$transclude((clone, scope) => {
      scope.bfe = {file};
      element.append(clone);
    });
  }

  renderFolder(scope) {
    return this.render(`
      <span class="bi-align bi-r-h">
        <span class="fe-icon-container" bi-html="renderFolderIcon(folder)"></span>

        <span class="bi-text--ellipsis" bi-draggable="events.onDrag(folder)">
          <span
            ng-if="vm.folders.get(folder).edit.enabled"
            ng-model="folder.name"
            contenteditable="{{vm.folders.get(folder).edit.enabled}}"
            on-change="events.onFolderRenamed(folder)"
            on-blur="events.onFolderBlur(folder)"
            ce-options="::{autoEdit: true}"
          >{{folder.getName()}}</span>

          <span ng-if="!vm.folders.get(folder).edit.enabled">{{folder.getName()}}</span>
        </span>
      </span>
    `)(scope);
  }

  renderFile(scope) {
    return this.render(`
      <span class="fe-item-name bi-r-h bi-align">
        <span class="fe-icon-container" bi-html="renderFileIcon(file)"></span>
        <span class="bi-text--ellipsis" bi-draggable="events.onDrag(file)">{{file.getName()}}</span>
      </span>
    `)(scope);
  }

  renderFolderIcon(scope, folder: Folder) {
    let html;

    if (!this.$transclude.isSlotFilled('folderIcon')) {
      html = inject('$compile')(`
        <i class="fe-icon bi-icon">folder</i>
      `)(assign(scope.$new(true), {folder}));
    } else {
      html = this.$transclude((_, s) => s.folder = itemToDef(folder), null, 'folderIcon');
    }
  
    return {html};
  }

  renderFileIcon(scope, file: File) {
    let html;

    if (!this.$transclude.isSlotFilled('fileIcon')) {
      html = inject('$compile')(`
        <i class="fe-icon bi-icon">insert_drive_file</i>
      `)(assign(scope.$new(true), {file}));
    } else {
      html = this.$transclude((_, s) => s.file = itemToDef(file), null, 'fileIcon');
    }
  
    return {html};
  }

  renderMenu(scope, folder: Folder) {
    let html;

    if (!this.$transclude.isSlotFilled('menu')) {
      html = inject('$compile')(`
        <ul class="bi-dropdown-menu">
          <li 
            class="bi-align bi-space-h"
            ng-repeat="type in ::options.fileAlias"
            ng-disabled="::!events.onFileCreate"
            ng-click="events.onFileCreate && events.onFileCreate(type, folder)"
          >
            <i class="bi-icon">note_add</i>
            <span>New {{::type}}</span>
          </li>

          <li 
            class="bi-align bi-space-h"
            ng-disabled="::!events.onFolderCreate"
            ng-click="events.onFolderCreate && events.onFolderCreate(folder)"
          >
            <i class="bi-icon">create_new_folder</i>
            <span>New folder</span>
          </li>

          <li class="bi-dropdown-separator"></li>

          <li 
            class="bi-align bi-space-h"
            ng-disabled="::!events.onFolderRename || !vm.folder.canRename(folder)"
            ng-click="events.onFolderRename && vm.folder.canRename(folder) && events.onFolderRename(folder)"
          >
            <i class="bi-icon">edit</i>
            <span>Rename</span>
          </li>

          <li 
            class="bi-align bi-space-h"
            ng-disabled="::!events.onFolderDelete || !vm.folder.canDelete(folder)"
            ng-click="events.onFolderDelete && vm.folder.canDelete(folder) && events.onFolderDelete(folder)"
          >
            <i class="bi-icon">delete</i>
            <span>Delete</span>
          </li>
        </ul>
      `)(assign(scope));
    } else {
      html = this.$transclude((_, s) => s.folder = itemToDef(folder), null, 'menu');
    }
  
    return {html};
  }
}
