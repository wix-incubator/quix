import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import {dbConf} from '../../config/db-conf';

@Entity({name: 'folders'})
export class DbFolder {
  @PrimaryColumn({...dbConf.idColumn})
  id!: string;

  @Column(dbConf.nameField)
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
