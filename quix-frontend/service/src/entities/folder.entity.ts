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
  @OneToOne(type => DbFileTreeNode, node => node.folder, {
    primary: true,
  })
  @JoinColumn({name: 'id'})
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
