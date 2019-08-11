import {
  Column,
  Entity,
  Index,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import {dbConf} from '../../config/db-conf';
import {DbFileTreeNode} from '../filenode/filenode.entity';

@Entity({name: 'folders'})
export class DbFolder {
  @PrimaryColumn({...dbConf.idColumn})
  id!: string;

  @Column(dbConf.shortTextField)
  name!: string;

  @Column(dbConf.shortTextField)
  owner!: string;

  @UpdateDateColumn(dbConf.dateUpdated)
  dateUpdated!: number;

  @CreateDateColumn(dbConf.dateCreated)
  dateCreated!: number;

  @Column({...dbConf.json, name: 'json_content'})
  jsonContent: any = {};

  isLiked!: boolean;
}
