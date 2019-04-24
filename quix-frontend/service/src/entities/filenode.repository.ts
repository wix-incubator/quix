import {
  EntityRepository,
  Repository,
  SaveOptions,
  DeepPartial,
  Entity,
} from 'typeorm';
import {DbFileTreeNode} from './filenode.entity';
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
        await this.setMpath(item);
      }
      return super.save(items, options);
    } else {
      const item = itemOrItems;
      await this.setMpath(item);
      return super.save(item, options);
    }
  }

  /**
   * Given a node with it's parent or parentId set,
   * set the mpath correctly for it.
   * @param item
   */
  private async setMpath(item: DeepPartial<DbFileTreeNode>) {
    let base = '';
    if (item.parent && item.parent.mpath) {
      base = item.parent.mpath;
    } else if (item.parentId || (item.parent && item.parent.id)) {
      const parent = await this.findOne(item.parentId || item.parent!.id);
      if (parent) {
        base = parent.mpath;
      } else {
        throw new Error(
          `saving file item ${item.id}:: Can't find parent node ${
            item.parentId
          }`,
        );
      }
    }
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
   * Given a user, return a list of tree items, not orderd in any order, not nested, just a plain list.
   * @returns {Promise<DbFileTreeNode[]>}
   */
  getNamesByUser(user: string) {
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
      .where('node.owner = :user', {user})
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
}
