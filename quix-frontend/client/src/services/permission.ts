import {Instance} from '../lib/app';
import {IEntity} from '../../../shared';

export const isOwner = (app: Instance, entity: Pick<IEntity, 'owner'>) => {
  return entity.owner === app.getUser().getEmail(); 
}