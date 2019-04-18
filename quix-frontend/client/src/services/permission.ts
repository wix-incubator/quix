import {Instance} from '../lib/app';
import {IEntity} from '../../../shared';

export const isOwner = (app: Instance, entity: IEntity) => {
  return entity.owner === app.getUser().getEmail(); 
}