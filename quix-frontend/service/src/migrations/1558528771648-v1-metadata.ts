import {MigrationInterface, QueryRunner} from 'typeorm';
import {DbMetadata} from '../entities/version-metadata.entity';
import {QUIX_SCHEMA} from '../consts';
const PREVIOUS_QUIX_SCHEMA = 0;
const CURRENT_QUIX_SCHEMA_VERSION = 1;

export class VersionMetadata1558528771648 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const metadata = new DbMetadata(QUIX_SCHEMA, CURRENT_QUIX_SCHEMA_VERSION);
    const manager = queryRunner.manager;
    await manager.save(DbMetadata, metadata);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    const metadata = new DbMetadata(QUIX_SCHEMA, PREVIOUS_QUIX_SCHEMA);
    const manager = queryRunner.manager;
    await manager.save(DbMetadata, metadata);
  }
}
