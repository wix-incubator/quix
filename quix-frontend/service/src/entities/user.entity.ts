import {Column, Entity, PrimaryColumn} from 'typeorm';
import {dbConf} from '../config/db-conf';

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
}

export interface IUser {
  id: string;
  name: string;
  avatar: string;
  rootFolder: string;
}

export const dbUserToUser = (dbuser: DbUser): IUser => {
  const {jsonContent, avatar, name, rootFolder, id} = dbuser;
  return {id, avatar: avatar || '', name: name || '', rootFolder};
};
