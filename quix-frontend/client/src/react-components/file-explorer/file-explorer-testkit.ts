import { Testkit } from '../../../test/e2e/driver';

const enum Hooks {
  FileExplorerTab = 'app-menu-DB Explorer',
  TreeItemContent = 'tree-item-content',
  TreeItemLoadingIcon = 'tree-item-loading-icon',
  TreeItemOpenedIcon = 'tree-item-opened-icon',
  TreeItemClosedIcon = 'tree-item-closed-icon',
  FileExplorerSearch = 'file-explorer-search',
}

export class FileExplorerTestkit extends Testkit {
  async toggleFileExplorerTab() {
    await this.click.hook(Hooks.FileExplorerTab);
  }
  
  async numOfTreeItems() {
    return (await this.query.hooks(Hooks.TreeItemContent)).length;
  }

  async numOfLoadingTreeItems() {
    return (await this.query.hooks(Hooks.TreeItemLoadingIcon)).length;
  }

  async numOfOpenedTreeItems() {
    return (await this.query.hooks(Hooks.TreeItemOpenedIcon)).length;
  }

  async numOfClosedTreeItems() {
    return (await this.query.hooks(Hooks.TreeItemClosedIcon)).length;
  }

  async clickOnTreeItemByPosition(position: number) {
    return (await this.query.hooks(Hooks.TreeItemContent))[position].click();
  }

  async getTreeItemIndexByName(name: string) {
    const position = await this.evaluate.hooks(
      Hooks.TreeItemContent,
      (elements, args) =>
        elements.findIndex(element => element.innerHTML === args.name),
      {name});
    return position;
  }

  async isTreeItemExistsByName(name: string) {
    const res = await this.getTreeItemIndexByName(name);
    return res !== -1;
  }
  
  async clickOnItemByName(name: string) {
    const position = await this.getTreeItemIndexByName(name);
    return this.clickOnTreeItemByPosition(position);
  }

  async search(query: string) {
    return this.keyboard.type(Hooks.FileExplorerSearch, query);
  }

}
