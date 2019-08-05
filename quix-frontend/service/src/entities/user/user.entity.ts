import {
  Column,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import {dbConf} from '../../config/db-conf';
import {IUser} from 'shared';

@Entity({name: 'users'})
export class DbUser {
  @PrimaryColumn('varchar', {length: 64})
  id!: string;

  @Column({...dbConf.shortTextField, nullable: true})
  name?: string;

  @Column(dbConf.userAvatar)
  avatar?: string;

  @Column({...dbConf.idColumn, name: 'root_folder'})
  rootFolder!: string;

  @Column({...dbConf.json, name: 'json_content'})
  jsonContent?: any;

  @UpdateDateColumn(dbConf.dateUpdated)
  dateUpdated!: number;

  @CreateDateColumn(dbConf.dateCreated)
  dateCreated!: number;
}

export const dbUserToUser = (dbuser: DbUser): IUser => {
  const {
    jsonContent,
    avatar,
    name,
    rootFolder,
    id,
    dateCreated,
    dateUpdated,
  } = dbuser;
  return {
    id,
    avatar: avatar || '',
    name: name || '',
    rootFolder,
    email: id,
    dateCreated,
    dateUpdated,
  };
};
