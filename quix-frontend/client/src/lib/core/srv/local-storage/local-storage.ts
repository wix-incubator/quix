'use strict';

export class LocalStorage {
  static prefix: string = '';
  private storage: Storage;

  constructor(storage?: Storage) {
    this.storage = storage || window.localStorage;
  }

  static setPrefix(prefix: string) {
    LocalStorage.prefix = prefix;
  }

  setStorage(storage: Storage) {
    this.storage = storage;
  }

  setItem(name: string, data: string) {
    name = LocalStorage.prefix + name;
    this.storage.setItem(name, data);
  }

  getItem(name: string) {
    name = LocalStorage.prefix + name;
    return this.storage.getItem(name);
  }

  clear() {
    this.storage.clear();
  }
}
