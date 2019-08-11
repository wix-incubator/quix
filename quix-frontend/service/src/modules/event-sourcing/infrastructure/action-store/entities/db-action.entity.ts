import {Column, Entity, Index} from 'typeorm';
import {IAction, IEventData} from '../../types';
import {IDBAction} from '../types';
import {dbConf} from '../../../../../config/db-conf';

@Entity({name: 'actions'})
@Index(['id', 'type'], {unique: false})
export class DbAction<T = IEventData, N extends string = string>
  implements IDBAction {
  @Column({...dbConf.idColumn, primary: true, unique: false})
  id!: string;

  @Column(dbConf.json)
  data!: T;

  @Column(dbConf.shortTextField)
  user!: string;

  @Index()
  @Column({...dbConf.eventsTimestamp, primary: true, name: 'date_created'})
  dateCreated?: Date;

  @Column({type: 'varchar', width: 64})
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
