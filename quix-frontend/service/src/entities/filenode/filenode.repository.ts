import {
  EntityRepository,
  Repository,
  SaveOptions,
  DeepPartial,
  Entity,
  EntityManager,
} from 'typeorm';
import {DbFileTreeNode} from './filenode.entity';
import {dbConf} from 'config/db-conf';
import assert from 'assert';
import {FileType} from 'shared';
import {DbNotebook} from '../notebook/dbnotebook.entity';
import {DbFolder} from '../folder/folder.entity';
import {DbFavorites} from '../favorites/favorites.entity';
/**
 * This custom repository saves a tree structure in sql, using path enumeration/materialized path.
 * We don't use the built in solution by typeorm as it doesn't support moving/deletions yet.
 */
@EntityRepository(DbFileTreeNode)
export class FileTreeRepository extends Repository<DbFileTreeNode> {
  save(
    entities: DeepPartial<DbFileTreeNode>[],
    options?: SaveOptions & {
      reload: false;
    },
  ): Promise<DbFileTreeNode[]>;
  save(
    entity: DeepPartial<DbFileTreeNode>,
    options?: SaveOptions & {
      reload: false;
    },
  ): Promise<DbFileTreeNode>;
  async save(
    itemOrItems: DeepPartial<DbFileTreeNode> | DeepPartial<DbFileTreeNode>[],
    options?: SaveOptions,
  ) {
    if (Array.isArray(itemOrItems)) {
      const items = itemOrItems;
      for (const item of items) {
        await this.setMpathByParent(item);
      }
      return super.save(items, options);
    } else {
      const item = itemOrItems;
      await this.setMpathByParent(item);
      return super.save(item, options);
    }
  }

  private async getParentPath(item: DeepPartial<DbFileTreeNode>) {
    if (item.parent && item.parent.mpath) {
      return item.parent.mpath;
    }
    const parentId = getParentId(item);
    if (parentId) {
      return this.findOneOrFail(parentId)
        .then(parent => parent.mpath)
        .catch(() => {
          throw new Error(
            `saving file item ${item.id}:: Can't find parent node ${item.parentId}`,
          );
        });
    }
    return '';
  }
  /**
   * Given a node with it's parent or parentId set,
   * set the mpath correctly for it.
   * @param item
   */
  private async setMpathByParent(item: DeepPartial<DbFileTreeNode>) {
    const base = await this.getParentPath(item);
    item.mpath = base + (base ? '.' : '') + item.id;
  }

  /**
   * given a list of ids, return a list of matching tree nodes, joined with name from folder/notebook.
   * @param ids
   */
  getNamesByIds(ids: string[]) {
    return this.createQueryBuilder('node')
      .select([
        'node.id',
        'node.type',
        'node.parentId',
        'notebook.name',
        'folder.name',
      ])
      .leftJoin('node.notebook', 'notebook')
      .leftJoin('node.folder', 'folder')
      .where('node.id IN (:...ids)', {ids})
      .getMany();
  }

  /**
   * Get a list of first level children
   * @returns {Promise<DbFileTreeNode[]>}
   */
  async getChildren(rootId: string) {
    return this.createQueryBuilder('node')
      .leftJoinAndSelect('node.notebook', 'notebook')
      .leftJoinAndSelect('node.folder', 'folder')
      .where('node.parentId = :rootId', {rootId})
      .getMany();
  }

  /**
   * Get a list of all children
   * @returns {Promise<DbFileTreeNode[]>}
   */
  async getDeepChildren(root: DbFileTreeNode, enityManager?: EntityManager) {
    const baseMpath = root.mpath;
    assert(baseMpath && baseMpath.length > 0, 'mpath is empty/undefined');

    const qb = enityManager
      ? enityManager.createQueryBuilder(DbFileTreeNode, 'node')
      : this.createQueryBuilder('node');

    return qb
      .where(`node.mpath LIKE ${dbConf.concat(`('${baseMpath}')`, `'%'`)}`)
      .getMany();
  }

  async moveTree(root: DbFileTreeNode, newParentNode: DbFileTreeNode) {
    if (root.id === newParentNode.id) {
      throw new Error(
        `Illegal request: can't move folder to itslef, or to it's parent`,
      );
    }
    if (root.parentId === newParentNode.id) {
      return;
    }
    const baseMpath = root.mpath;
    assert(baseMpath && baseMpath.length > 0, 'mpath is empty/undefined');

    const newBasePath = newParentNode.mpath + '.' + root.id;
    return this.manager.transaction(async em => {
      await em
        .createQueryBuilder()
        .update(DbFileTreeNode)
        .set({
          mpath: () => `replace(\`mpath\`, '${baseMpath}', '${newBasePath}')`,
        })
        .where(`mpath LIKE ${dbConf.concat(`('${baseMpath}')`, `'%'`)}`)
        .execute();

      await em
        .createQueryBuilder()
        .update(DbFileTreeNode)
        .set({parentId: newParentNode.id})
        .where('id = :id', {id: root.id})
        .execute();
    });
  }

  async deleteTree(root: DbFileTreeNode) {
    const baseMpath = root.mpath;
    assert(baseMpath && baseMpath.length > 0, 'mpath is empty/undefined');
    const children = await this.getDeepChildren(root);

    const [foldersToDeltete, notebooksToDelete] = children.reduce(
      ([foldersIds, notebookIds], node) => {
        (node.type === FileType.folder ? foldersIds : notebookIds).push(node);
        return [foldersIds, notebookIds];
      },
      [[], []] as DbFileTreeNode[][],
    );

    return this.manager.transaction(async em => {
      if (notebooksToDelete.length) {
        await em
          .createQueryBuilder()
          .delete()
          .from(DbNotebook)
          .whereInIds(notebooksToDelete)
          .execute();

        await em
          .createQueryBuilder()
          .delete()
          .from(DbFavorites)
          .where('entity_id in (:...ids)', {
            ids: notebooksToDelete.map(({id}) => id),
          })
          .execute();
      }
      if (foldersToDeltete.length) {
        await em
          .createQueryBuilder()
          .delete()
          .from(DbFolder)
          .whereInIds(foldersToDeltete)
          .execute();
      }
    });
  }
}

function getParentId(node: DeepPartial<DbFileTreeNode>) {
  return node.parent && node.parent.id !== undefined
    ? node.parent.id
    : node.parentId;
}
