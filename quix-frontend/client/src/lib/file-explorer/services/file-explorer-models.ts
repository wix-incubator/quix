import {find, pull} from 'lodash';
import {utils, srv} from '../../core';

const {uuid} = utils;
const {EventEmitter} = srv.eventEmitter;

export class Item {
  private parent: Folder;
  private readonly eventEmitter;

  constructor(private readonly id: string, private readonly name: string, private readonly type: string, private readonly data = {}) {
    this.eventEmitter = new EventEmitter();
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getType(): string {
    return this.type;
  }

  public setParent(parent: Folder): Item {
    this.parent = parent;
    return this;
  }

  public getParent(): Folder {
    return this.parent;
  }

  public getDepth(): number {
    let res = 0;
    let parent: Item = this;

    // tslint:disable-next-line: no-conditional-assignment
    while (parent = parent.getParent()) {
      res++;
    }

    return res;
  }

  public getData(): any {
    return this.data;
  }

  public getParentById(id: string): Item {
    let res: Item;
    let parent: Item = this;

    // tslint:disable-next-line: no-conditional-assignment
    while (parent = parent.getParent()) {
      if (parent.getId() === id) {
        res = res || parent;
        break;
      }
    }

    return res;
  }

  public on(name, fn, invoke?, scope?) {
    this.eventEmitter.on(name, fn, invoke, scope);
  }

  public trigger(name, ...args) {
    this.eventEmitter.trigger(name, ...args);
  }
}

export class File extends Item {
  constructor(id: string, name: string, type: string = 'file', data = {}) {
    super(id, name, type, data);
  }

  public moveTo(folder: Folder): File {
    folder.addFile(this.getParent().removeFile(this));
    return this;
  }
}

export class Folder extends Item {
  private folders: Folder[] = [];
  private files: File[] = [];
  private lazy: boolean = false;
  private readonly status = {
    open: false,
    edit: false,
    hasFileLeaf: false
  };

  constructor(id: string, name: string, data = {}) {
    super(id, name, 'folder', data);
  }

  public setFolders(folders: Folder[]): Folder {
    this.folders = folders;

    return this;
  }

  public setFiles(files: File[]): Folder {
    this.files = files;

    return this;
  }

  public setLazy(lazy: boolean = false): Folder {
    this.lazy = lazy;

    return this;
  }

  public isLazy(lazy: boolean = false): boolean {
    return this.lazy;
  }

  public getFolderById(id: string): Folder {
    return find(this.folders, (folder: Folder) => folder.getId() === id);
  }

  public getFileById(id: string): File {
    return find(this.files, (file: File) => file.getId() === id);
  }

  public getFolders(): Folder[] {
    return this.folders;
  }

  public getFiles(): File[] {
    return this.files;
  }

  public createFolder(name: string): Folder {
    return this.addFolder(uuid(), name);
  }

  public createFile(name: string, type?): File {
    return this.addFile(uuid(), name, type);
  }

  public addFolder(idOrFolder: string | Folder, name?: string, data = {}): Folder {
    const folder = idOrFolder instanceof Folder ? idOrFolder : new Folder(idOrFolder, name, data);

    folder.setParent(this);

    this.folders.push(folder);

    return folder;
  }

  public addFile(idOrFile: string | File, name?: string, type?: string, data = {}): File {
    const file = idOrFile instanceof File ? idOrFile : new File(idOrFile, name, type, data);

    file.setParent(this);

    this.files.push(file);

    return file;
  }

  public removeFile(file: File): File {
    pull(this.files, file);

    return file;
  }

  public removeFolder(folder: Folder): Folder {
    pull(this.folders, folder);

    return folder;
  }

  public hasFiles(): boolean {
    return !!this.files.length;
  }

  public hasFolders(): boolean {
    return !!this.folders.length;
  }

  public isEmpty(): boolean {
    return !this.hasFolders() && !this.hasFiles() && !this.lazy;
  }

  public hasFileLeaf(): boolean {
    return this.status.hasFileLeaf;
  }

  public isOpen(): boolean {
    return this.status.open;
  }

  public toggleOpen(open?: boolean): Folder {
    this.status.open = typeof open === 'undefined' ? !this.status.open : open;

    if (this.getParent()) {
      this.getParent().trigger('openToggled', this.getParent(), this, this.isOpen());
    }

    return this;
  }

  public toggleEdit(edit?: boolean): Folder {
    this.status.edit = typeof edit === 'undefined' ? !this.status.edit : edit;

    if (this.getParent()) {
      this.getParent().trigger('editToggled', this.getParent(), this, this.status.edit);
    }

    return this;
  }

  public toggleHasFileLeaf(hasFileLeaf: boolean): Folder {
    this.status.hasFileLeaf = hasFileLeaf;
    return this;
  }

  public moveTo(folder: Folder): Folder {
    folder.addFolder(this.getParent().removeFolder(this));
    return this;
  }

  public getLength(res = 1): number {
    return Math.max(res, ...(this.folders.map(folder => folder.getLength(res + 1))));
  }

  public destroy() {
    this.getParent().removeFolder(this);
  }

  public $clone(): Folder {
    const folder = new Folder(this.getId(), this.getName());

    return folder
      .setFolders(this.getFolders())
      .setFiles(this.getFiles())
      .setLazy(this.lazy);
  }
}
