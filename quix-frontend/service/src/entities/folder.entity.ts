import {
  Column,
  Entity,
  Index,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
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

  @Column(dbConf.dateUpdated)
  dateUpdated!: Date;

  @Column(dbConf.dateCreated)
  dateCreated!: Date;

  isLiked!: boolean;
}
