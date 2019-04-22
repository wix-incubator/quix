import {Column, Entity, Index, PrimaryColumn} from 'typeorm';
import {IAction, IEventData} from '../../types';
import {IDBAction} from '../types';
import {dbConf} from '../../../../../config/db-conf';

@Entity()
export class DbAction<T = IEventData, N extends string = string>
  implements IDBAction {
  @PrimaryColumn(dbConf.idColumn)
  id!: string;

  @Column(dbConf.json)
  data!: T;

  @Column(dbConf.tinytext)
  user?: string;

  @Index()
  @Column(dbConf.eventsTimestamp)
  dateCreated?: Date;

  @Column(dbConf.tinytext)
  type!: N;

  constructor(base?: IAction<T, N>) {
    if (base) {
      const {id, dateCreated, user, type, ...data} = base;
      this.dateCreated = dateCreated;
      this.user = user;
      this.type = type;
      this.data = data as any;
      this.id = id;
    }
  }
}
