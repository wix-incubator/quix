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
import {dbConf} from '../config/db-conf';
import {DbFileTreeNode} from './filenode.entity';

@Entity()
export class DbFolder {
  @PrimaryColumn(dbConf.idColumn)
  id!: string;

  @Column(dbConf.tinytext)
  name!: string;

  @Column(dbConf.tinytext)
  owner!: string;

  @UpdateDateColumn(dbConf.dateUpdated)
  dateUpdated!: number;

  @CreateDateColumn(dbConf.dateCreated)
  dateCreated!: number;

  isLiked!: boolean;
}
