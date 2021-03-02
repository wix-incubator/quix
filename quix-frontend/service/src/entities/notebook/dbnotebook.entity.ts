import {IFilePathItem, INotebook} from '@wix/quix-shared';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import {dbConf} from '../../config/db-conf';
import {convertDbNote, convertNoteToDb, DbNote} from '../note/dbnote.entity';
import {DbFileTreeNode} from '../filenode/filenode.entity';
import {DbUser} from '../user/user.entity';
import {extractOwnerDetails} from '../utils';

@Entity({name: 'notebooks'})
export class DbNotebook {
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

  @Column({...dbConf.json, name: 'json_content'})
  jsonContent: any;

  @OneToMany(type => DbNote, n => n.notebook, {onDelete: 'CASCADE'})
  notes?: DbNote[];

  @OneToOne(type => DbFileTreeNode, node => node.notebook, {
    onDelete: 'CASCADE',
  })
  fileNode?: DbFileTreeNode;

  constructor(base?: DbNotebook) {
    if (base) {
      const {id, dateCreated, dateUpdated, name, notes, owner} = base;
      this.id = id;
      this.dateCreated = dateCreated;
      this.dateUpdated = dateUpdated;
      this.name = name;
      this.notes = notes;
      this.owner = owner;
    }
    this.jsonContent = this.jsonContent || {};
  }
}

export const convertDbNotebook = (
  dbNotebook: DbNotebook,
  computedPath?: IFilePathItem[],
  isLiked?: boolean,
): INotebook => {
  const {dateCreated, dateUpdated, id, name, owner, notes} = dbNotebook;

  const ownerDetails = extractOwnerDetails(dbNotebook);

  return {
    id,
    dateCreated,
    dateUpdated,
    name,
    owner,
    isLiked: isLiked !== undefined ? isLiked : false,
    notes: notes ? notes.map(convertDbNote) : [],
    path: computedPath || [],
    ownerDetails,
  };
};

export const covertNotebookToDb = (notebook: INotebook): DbNotebook => {
  const {id, name, owner, notes, dateCreated, dateUpdated} = notebook;

  return new DbNotebook({
    id,
    dateCreated,
    dateUpdated,
    name,
    owner,
    jsonContent: {},
  });
};
