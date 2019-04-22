import {srv} from '../../core';
import {IItemDef} from './';
import {File} from './file-explorer-models';
import {goToFile} from './file-explorer-tools';

/**
 *  Will be propagated using on-load
 */
export default class Instance extends srv.eventEmitter.EventEmitter {
  constructor (private readonly scope) {
    super();
  }

  createFolder() {
    this.scope.events.onFolderCreate();
  }

  createFile(type?: string) {
    this.scope.events.onFileCreate(type);
  }

  setActive(fileDef: IItemDef) {
    const file: File = goToFile(fileDef, this.scope.model);
    this.scope.vm.folder.setCurrent(file);
    this.scope.vm.file.setCurrent(file);
  }

  clearActive() {
    this.scope.vm.folder.setCurrent(null);
    this.scope.vm.file.setCurrent(null);
  }
}