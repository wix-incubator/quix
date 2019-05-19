import {Column, Entity, PrimaryColumn} from 'typeorm';
import {dbConf} from '../config/db-conf';

@Entity({name: 'user'})
export class DbUser {
  @PrimaryColumn('varchar', {length: 64})
  id!: string;

  @Column({...dbConf.shortTextField, nullable: true})
  name?: string;

  @Column(dbConf.userAvatar)
  avatar?: string;

  @Column(dbConf.idColumn)
  rootFolder!: string;

  @Column({...dbConf.json, nullable: true})
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
