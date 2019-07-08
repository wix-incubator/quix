import {Item, File, Folder} from '../services/file-explorer-models';

export default {
  order: {
    field: 'name',
    setField(field: string, reversed = false) {
      this.field = reversed ? '-' + field : field;
    }
  },
  dropped: {
    item: null as Item
  },
  folder: {
    getPermissions(folder) {
      const vm = this.$root.folders.get(folder);
      return (vm.permissions = vm.permissions || this.$params.controller.getPermissions(folder));
    },
    canDelete(folder) {
      return this.getPermissions(folder).delete;
    },
    canRename(folder) {
      return this.getPermissions(folder).rename;
    },
    hasMenu(folder) {
      return this.getPermissions(folder).menu;
    },
    toggleOpen(folder, value) {
      this.$root.folders.get(folder).open.toggle(value);
    },
    toggleEdit(folder, value) {
      this.$root.folders.get(folder).edit.toggle(value);
    },
    isOpen(folder) {
      return this.$root.folders.get(folder).open.enabled;
    },
    setCurrent(folder: Folder) {
      this.$params.controller.setCurrentFolder(folder);
    },
    getCurrent(): Folder {
      return this.$params.controller.getCurrentFolder();
    },
    isActive(folder: File): boolean {
      return folder.getId() === (this.getCurrent() && this.getCurrent().getId());
    },
    isEmpty(): boolean {
      return this.$params.item.isEmpty();
    },
    $init() {
      if (this.$params.item) {
        this.$params.item.on('openToggled', (model, folder, isOpen) => {
          this.$root.folder.toggleOpen(folder, isOpen);
        }, true);

        this.$params.item.on('editToggled', (model, folder, edit) => {
          this.$root.folder.toggleEdit(folder, edit);
        }, true);
      }
    }
  },
  file: {
    setCurrent(file: File) {
      this.$params.controller.setCurrentFile(file);
    },
    getCurrent(): File {
      return this.$params.controller.getCurrentFile();
    },
    isActive(file: File): boolean {
      return file.getId() === (this.getCurrent() && this.getCurrent().getId());
    }
  },
  $init() {
    if (!this.$params.controller) {
      return;
    }

    this.folders = this.folders || this.createItemsVm({
      menu: {},
      edit: {},
      open: {},
      permissions: null
    });

    this.container = this.$params.controller.getContainer();
  }
};
