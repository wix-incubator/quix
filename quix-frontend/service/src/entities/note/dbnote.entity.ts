import {
  Column,
  Entity,
  Index,
  PrimaryColumn,
  ManyToOne,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import {INote, IBaseNote} from '@wix/quix-shared/entities/note';
import {DbNotebook} from '../notebook/dbnotebook.entity';
import {dbConf} from '../../config/db-conf';

@Entity({name: 'notes'})
export class DbNote {
  @PrimaryColumn({...dbConf.idColumn})
  id!: string;

  /** for any extra properties that might be added in the future */
  @Column({...dbConf.json, name: 'json_content'})
  jsonContent!: any;

  /** for note data */
  @Column({...dbConf.json, name: 'rich_content'})
  richContent!: any;

  @Index({fulltext: true})
  @Column(dbConf.noteContent)
  textContent!: string;

  @Column(dbConf.shortTextField)
  type!: string;

  @Column(dbConf.nameField)
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
    richContent,
    type,
  } = dbNote;

  return {
    type,
    id,
    content: textContent,
    richContent: richContent || {},
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
    richContent,
  } = note;

  return new DbNote({
    type,
    id,
    textContent: note.content,
    jsonContent: {},
    richContent,
    name,
    notebookId,
    owner,
    dateCreated,
    dateUpdated,
    rank: undefined,
  });
};
