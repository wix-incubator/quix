import {Item, File, Folder} from './file-explorer-models';
import {itemToDef} from './file-explorer-tools';
import Instance from './file-explorer-instance';

interface Permissions {
  rename: boolean;
  delete: boolean;
}

/**
 * Will be required by <file-explorer-inner>
 */
export default class Controller {
  private readonly ngModel: ng.INgModelController;
  private readonly instance: Instance;
  private currentFolder: Folder = null;
  private currentFile: File = null;
  private readonly $transclude: Function;

  constructor(private readonly $scope, $element, $transclude) {
    this.instance = new Instance($scope);
    this.ngModel = $element.controller('ngModel');
    this.$transclude = $transclude;
  }

  getInstance(): Instance {
    return this.instance;
  }

  getPermissions(folder): Permissions {
    return this.$scope.getFolderPermissions({folder: itemToDef(folder)}) || {
      rename: true,
      delete: true
    };
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

  openLazyFolder(folder: Folder) {
    return this.$scope.onLazyFolderOpen({folder: itemToDef(folder)});
  }

  transclude(element, file) {
    this.$transclude((clone, scope) => {
      scope.bfe = {file};
      element.append(clone);
    });
  }
}
