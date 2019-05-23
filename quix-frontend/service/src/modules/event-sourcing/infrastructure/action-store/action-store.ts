import {Repository, In} from 'typeorm';
import {IAction} from '../types';
import {DbAction} from './entities/db-action.entity';
import {IActionStore, IDBAction} from './types';
import {InjectRepository} from '@nestjs/typeorm';
import {Injectable} from '@nestjs/common';

// TODO: benchmark
const convertDbActionToAction = (input: IDBAction): IAction => {
  const {data, ...rest} = input;
  return {...rest, ...data};
};

const convertActionToDbAction = (input: IAction): IDBAction => {
  const {id, dateCreated, type, user, ...rest} = input;
  return {data: rest, id, type, user};
};

@Injectable()
export class DbActionStore implements IActionStore {
  constructor(@InjectRepository(DbAction) private repo: Repository<DbAction>) {}

  async pushAction(action: IAction | IAction[]) {
    const actions: IAction[] = Array.isArray(action) ? action : [action];
    await this.repo.save(actions.map(convertActionToDbAction));
    return actions;
  }

  // TODO: implement orderBy
  async get(aggId?: string | string[], orderBy?: string) {
    const ids = !!aggId ? (Array.isArray(aggId) ? aggId : [aggId]) : undefined;
    const results = await (!ids
      ? this.repo.find()
      : this.repo.find({id: In(ids)}));

    return results.map(convertDbActionToAction);
  }
}
