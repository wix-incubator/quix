import {EntityType} from '../../common/entity-type.enum';
import {dbConf} from '../../config/db-conf';
import {Column, Entity, Index} from 'typeorm';

@Entity({name: 'favorites'})
@Index(['entityId'])
export class DbFavorites {
  @Column({...dbConf.shortTextField, primary: true, unique: false})
  owner!: string;

  @Column({...dbConf.idColumn, unique: false, primary: true, name: 'entity_id'})
  entityId!: string;

  @Column({...dbConf.entityTypeEnum, name: 'entity_type'})
  entityType!: EntityType;
}
