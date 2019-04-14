import {Repository} from 'typeorm';
import {IAction} from '../types';
import {MySqlAction} from './entities/mysql-action';
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
  return {data: rest, id, dateCreated, type, user};
};

@Injectable()
export class DbActionStore implements IActionStore {
  constructor(
    @InjectRepository(MySqlAction) private repo: Repository<MySqlAction>,
  ) {}

  async pushAction(action: IAction | IAction[]) {
    const actions: IAction[] = Array.isArray(action) ? action : [action];
    await this.repo.save(actions.map(convertActionToDbAction));
    return actions;
  }

  // TODO: implement orderBy
  async get(aggId?: string | string[], orderBy?: string) {
    const ids = Array.isArray(aggId) ? aggId : [aggId];
    const results = await (!ids ? this.repo.find() : this.repo.findByIds(ids));

    return results.map(convertDbActionToAction);
  }
}
