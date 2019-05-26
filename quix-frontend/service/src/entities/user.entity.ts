import {Column, Entity, PrimaryColumn} from 'typeorm';
import {dbConf} from '../config/db-conf';
import {sanitizeUserEmail, sanitizeUserName} from 'utils/sanitizer';
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
}

export const dbUserToUser = (dbuser: DbUser, sanitize = false): IUser => {
  const {avatar, name, rootFolder, id} = dbuser;
  const email = sanitize ? sanitizeUserEmail(id) : id;

  return {
    id: email,
    email,
    avatar: avatar || '',
    name: sanitize ? sanitizeUserName(name || '') : name || '',
    rootFolder,
  };
};
