import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';
import {dbConf} from '../config/db-conf';

@Entity({name: 'version_metadata'})
export class DbMetadata {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({type: 'double'})
  version!: number;

  @Column(dbConf.json)
  jsonContent: any = {};

  constructor(name: string, version: number, jsonContent = {}) {
    this.name = name;
    this.version = version;
    this.jsonContent = jsonContent;
  }
}
