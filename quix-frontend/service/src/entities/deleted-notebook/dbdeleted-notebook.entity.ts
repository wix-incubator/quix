import {IFilePathItem, INotebook} from '@wix/quix-shared';
import {IDeletedNotebook} from '@wix/quix-shared/entities/notebook/types';
import {dbConf} from 'src/config/db-conf';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import {DbFileTreeNode} from '../filenode/filenode.entity';
import {convertDbNote, DbNote} from '../note/dbnote.entity';
import {DbUser} from '../user/user.entity';
import {extractOwnerDetails} from '../utils';

@Entity('deleted_notebooks')
export class DbDeletedNotebook {
  @PrimaryColumn({...dbConf.idColumn})
  id!: string;

  @Column(dbConf.nameField)
  name!: string;

  @Column(dbConf.shortTextField)
  owner!: string;

  ownerDetails?: DbUser;

  @UpdateDateColumn(dbConf.dateUpdated)
  dateUpdated!: number;

  @CreateDateColumn(dbConf.dateCreated)
  dateCreated!: number;

  @CreateDateColumn(dbConf.dateDeleted)
  dateDeleted!: number;

  @Column({...dbConf.json, name: 'json_content'})
  jsonContent: any;

  @OneToMany(type => DbNote, n => n.notebook, {onDelete: 'CASCADE'})
  notes?: DbNote[];

  @OneToOne(type => DbFileTreeNode, node => node.notebook, {
    onDelete: 'CASCADE',
  })
  fileNode?: DbFileTreeNode;

  constructor(base?: DbDeletedNotebook) {
    if (base) {
      const {id, dateCreated, dateUpdated, name, notes, owner} = base;
      this.id = id;
      this.dateCreated = dateCreated;
      this.dateUpdated = dateUpdated;
      this.dateDeleted = this.dateDeleted;
      this.name = name;
      this.notes = notes;
      this.owner = owner;
    }
    this.jsonContent = this.jsonContent || {};
  }
}

export const convertDbDeletedNotebook = (
  dbDeletedNotebook: DbDeletedNotebook,
  computedPath?: IFilePathItem[],
  isLiked?: boolean,
): IDeletedNotebook => {
  const {
    dateCreated,
    dateUpdated,
    dateDeleted,
    id,
    name,
    owner,
    notes,
  } = dbDeletedNotebook;

  const ownerDetails = extractOwnerDetails(dbDeletedNotebook);

  return {
    id,
    dateCreated,
    dateUpdated,
    dateDeleted,
    name,
    owner,
    isLiked: isLiked !== undefined ? isLiked : false,
    notes: notes ? notes.map(convertDbNote) : [],
    path: computedPath || [],
    ownerDetails,
  };
};

export const covertNotebookToDb = (
  notebook: IDeletedNotebook,
): DbDeletedNotebook => {
  const {
    id,
    name,
    owner,
    notes,
    dateCreated,
    dateUpdated,
    dateDeleted,
  } = notebook;

  return new DbDeletedNotebook({
    id,
    dateCreated,
    dateUpdated,
    dateDeleted,
    name,
    owner,
    jsonContent: {},
  });
};
