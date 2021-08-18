import {EntityRepository, Repository} from 'typeorm';
import {DbDeletedNotebook} from './dbdeleted-notebook.entity';

@EntityRepository(DbDeletedNotebook)
export class DeletedNotebookRepository extends Repository<DbDeletedNotebook> {}
