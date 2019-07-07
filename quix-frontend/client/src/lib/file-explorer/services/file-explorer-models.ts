import {pull} from 'lodash';
import {utils, srv} from '../../core';

const {uuid} = utils;
const {EventEmitter} = srv.eventEmitter;

export class Item {
  private parent: Folder;
  private readonly eventEmitter;

  constructor(
    private readonly id: string,
    private readonly name: string,
    private readonly type: string,
    private readonly data = {}
  ) {
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
    this.eventEmitter.triggerStream(name, ...args);
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
  private pool: Record<string, Folder | File> = {};
  private folders: Folder[] = [];
  private files: File[] = [];
  private lazy: boolean = false;
  private limit: number = null;
  private readonly status = {
    open: false,
    edit: false,
    hasFileLeaf: false
  };

  constructor(id: string, name: string, data = {}) {
    super(id, name, 'folder', data);
  }

  public setPool(pool: Record<string, Folder | File>): Folder {
    this.pool = pool;

    return this;
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

  public isLazy(): boolean {
    return this.lazy;
  }

  public getFolderById(id: string): Folder {
    return this.pool[id] as Folder;
  }

  public getFileById(id: string): File {
    return this.pool[id] as File;
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
    this.pool[folder.getId()] = folder;

    return folder;
  }

  public addFile(idOrFile: string | File, name?: string, type?: string, data = {}): File {
    const file = idOrFile instanceof File ? idOrFile : new File(idOrFile, name, type, data);

    file.setParent(this);

    this.files.push(file);
    this.pool[file.getId()] = file;

    return file;
  }

  public removeFile(file: File): File {
    pull(this.files, file);

    // tslint:disable-next-line: no-dynamic-delete
    delete this.pool[file.getId()];

    return file;
  }

  public removeFolder(folder: Folder): Folder {
    pull(this.folders, folder);

    // tslint:disable-next-line: no-dynamic-delete
    delete this.pool[folder.getId()];

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

  public setLimit(limit: number) {
    this.limit = limit;
  }

  public getLimit() {
    return this.limit;
  }

  public destroy() {
    this.getParent().removeFolder(this);
  }

  public $clone(): Folder {
    const folder = new Folder(this.getId(), this.getName(), this.getData());

    return folder
      .setPool(this.pool)
      .setFolders(this.getFolders())
      .setFiles(this.getFiles())
      .setLazy(this.lazy);
  }
}
