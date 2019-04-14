import {Column, Entity, Index, PrimaryColumn} from 'typeorm';
import {IAction, IEventData} from '../../types';
import {IDBAction} from '../types';

/** should be used for testing/local-run */

@Entity()
export class SqljsAction<T = IEventData, N extends string = string>
  implements IDBAction {
  @PrimaryColumn()
  id!: string;

  @Column({type: 'simple-json'})
  data!: T;

  @Column({type: 'varchar', width: 255})
  user?: string;

  @Index()
  @Column({type: 'datetime', width: 4, default: () => 'CURRENT_TIMESTAMP'})
  dateCreated?: Date;

  @Column({type: 'varchar', width: 255})
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
