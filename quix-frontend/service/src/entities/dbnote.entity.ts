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
import {INote, NoteType, BaseNote} from '../../../shared/entities/note';
import {DbNotebook} from './dbnotebook.entity';
import {dbConf} from '../config/db-conf';

@Entity()
export class DbNote implements BaseNote {
  @PrimaryColumn(dbConf.idColumn)
  id!: string;

  @Column(dbConf.json)
  jsonContent!: any;

  @Index({fulltext: true})
  @Column(dbConf.noteContent)
  textContent!: string;

  @Column(dbConf.tinytext)
  type!: NoteType;

  @Column(dbConf.tinytext)
  name!: string;

  @Column(dbConf.tinytext)
  owner!: string;

  @UpdateDateColumn(dbConf.dateUpdated)
  dateUpdated!: number;

  @CreateDateColumn(dbConf.dateCreated)
  dateCreated!: number;

  @ManyToOne(type => DbNotebook, n => n.notes, {onDelete: 'CASCADE'})
  notebook!: DbNotebook;

  @Column()
  notebookId!: string;

  content: any;

  @AfterLoad()
  updateContentOnLoad() {
    if (this.type === NoteType.PRESTO) {
      this.content = this.textContent;
    } else if (this.type === NoteType.NATIVE) {
      this.content = this.jsonContent.native;
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  updateContent() {
    this.jsonContent = this.jsonContent || {};
    if (this.type === NoteType.PRESTO) {
      this.textContent = this.content;
    } else if (this.type === NoteType.NATIVE) {
      this.jsonContent.native = this.content;
    }
  }

  constructor(base?: INote) {
    if (base) {
      const {
        id,
        dateCreated,
        dateUpdated,
        name,
        owner,
        content,
        notebookId,
        type,
      } = base;
      this.id = id;
      this.dateCreated = dateCreated;
      this.dateUpdated = dateUpdated;
      this.content = content;
      this.name = name;
      this.notebookId = notebookId;
      this.owner = owner;
      this.type = type;
      this.updateContent();
    }
  }
}

// export const convertDbNote = (dbNote: DbNote): INote => {
//   const {
//     dateCreated,
//     dateUpdated,
//     id,
//     name,
//     notebookId,
//     owner,
//     textContent,
//   } = dbNote;

//   return {
//     type: NoteType.PRESTO,
//     id,
//     content: textContent,
//     dateCreated: dateCreated.valueOf(),
//     dateUpdated: dateUpdated.valueOf(),
//     name,
//     notebookId,
//     owner,
//   };
// };

// export const convertNoteToDb = (note: INote): Partial<DbNote> => {
//   const {id, name, notebookId, owner, type, content} = note;

//   return {
//     type,
//     id,
//     textContent: note.type === NoteType.PRESTO ? note.content : '',
//     name,
//     notebookId,
//     owner,
//   };
// };
