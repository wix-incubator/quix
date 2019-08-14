import {EntityRepository, Repository} from 'typeorm';
import {DbNotebook} from './dbnotebook.entity';

@EntityRepository(DbNotebook)
export class NotebookRepository extends Repository<DbNotebook> {}
