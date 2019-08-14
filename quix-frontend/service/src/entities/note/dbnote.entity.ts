import {
  Column,
  Entity,
  Index,
  PrimaryColumn,
  ManyToOne,
  AfterLoad,
  BeforeUpdate,
  BeforeInsert,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import {INote, IBaseNote} from 'shared/entities/note';
import {DbNotebook} from '../notebook/dbnotebook.entity';
import {dbConf} from '../../config/db-conf';

@Entity({name: 'notes'})
export class DbNote {
  @PrimaryColumn({...dbConf.idColumn})
  id!: string;

  @Column({...dbConf.json, name: 'json_content'})
  jsonContent!: any;

  @Index({fulltext: true})
  @Column(dbConf.noteContent)
  textContent!: string;

  @Column(dbConf.shortTextField)
  type!: string;

  @Column(dbConf.shortTextField)
  name!: string;

  @Index()
  @Column(dbConf.shortTextField)
  owner!: string;

  @UpdateDateColumn(dbConf.dateUpdated)
  dateUpdated!: number;

  @CreateDateColumn(dbConf.dateCreated)
  dateCreated!: number;

  @ManyToOne(type => DbNotebook, n => n.notes, {onDelete: 'CASCADE'})
  notebook?: DbNotebook;

  @Column()
  notebookId!: string;

  @Column({type: 'integer'})
  rank?: number;

  constructor(base?: DbNote) {
    if (base) {
      Object.assign(this, base);
    }
  }
}

export const convertDbNote = (dbNote: DbNote): INote => {
  const {
    dateCreated,
    dateUpdated,
    id,
    name,
    notebookId,
    owner,
    textContent,
    jsonContent,
    type,
  } = dbNote;

  return {
    type,
    id,
    content: textContent,
    dateCreated,
    dateUpdated,
    name,
    notebookId,
    owner,
  };
};

export const convertNoteToDb = (note: INote): DbNote => {
  const {
    id,
    name,
    notebookId,
    owner,
    type,
    content,
    dateCreated,
    dateUpdated,
  } = note;

  return new DbNote({
    type,
    id,
    textContent: note.content,
    jsonContent: {},
    name,
    notebookId,
    owner,
    dateCreated,
    dateUpdated,
    rank: undefined,
  });
};
