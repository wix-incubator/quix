import {
  Column,
  Entity,
  Index,
  PrimaryColumn,
  TreeParent,
  TreeChildren,
  OneToOne,
  JoinColumn,
  Tree,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {IFile, FileType} from 'shared/entities/file';
import {DbNotebook} from './dbnotebook.entity';
import {DbFolder} from './folder.entity';
import {dbConf} from '../config/db-conf';

@Entity()
export class DbFileTreeNode {
  constructor(id?: string, rest: Partial<DbFileTreeNode> = {}) {
    if (id) {
      this.id = id;
      Object.assign(this, rest);
    }
  }
  @PrimaryColumn(dbConf.idColumn)
  id!: string;

  @Index()
  @Column(dbConf.shortTextField)
  owner!: string;

  @UpdateDateColumn(dbConf.dateUpdated)
  dateUpdated!: number;

  @CreateDateColumn(dbConf.dateCreated)
  dateCreated!: number;

  @Column(dbConf.fileTypeEnum)
  type!: FileType;

  @ManyToOne(type => DbFileTreeNode, {onDelete: 'CASCADE'})
  @JoinColumn()
  parent?: DbFileTreeNode;

  @Column({nullable: true})
  parentId?: string;

  @OneToOne(type => DbNotebook, notebook => notebook.fileNode, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  notebook?: DbNotebook;

  @Column({nullable: true})
  notebookId?: string;

  @OneToOne(type => DbFolder, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  folder?: DbFolder;

  @Column({nullable: true, type: 'varchar', length: 1024})
  mpath!: string;
}
