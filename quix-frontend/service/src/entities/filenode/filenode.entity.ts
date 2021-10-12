import {
  Column,
  Entity,
  Index,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {IFile, FileType} from '@wix/quix-shared/entities/file';
import {DbNotebook} from '../notebook/dbnotebook.entity';
import {DbFolder} from '../folder/folder.entity';
import {dbConf} from '../../config/db-conf';
import {IUser} from '@wix/quix-shared';

@Entity({name: 'tree_nodes'})
export class DbFileTreeNode {
  constructor(id?: string, rest: Partial<DbFileTreeNode> = {}) {
    if (id) {
      this.id = id;
      Object.assign(this, rest);
    }
  }
  @PrimaryColumn({...dbConf.idColumn})
  id!: string;

  @Index()
  @Column(dbConf.shortTextField)
  owner!: string;

  ownerDetails?: IUser;

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
