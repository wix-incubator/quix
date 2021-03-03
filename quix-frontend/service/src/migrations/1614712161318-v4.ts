import {MigrationInterface, QueryRunner} from 'typeorm';
import {DbMetadata} from '../entities/version-metadata.entity';
import {QUIX_SCHEMA} from '../consts';
const PREVIOUS_QUIX_SCHEMA = 3;
const CURRENT_QUIX_SCHEMA_VERSION = 4;

export class v41614712161318 implements MigrationInterface {
  name = 'v41614712161318';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `notes` MODIFY COLUMN `name` varchar(512) NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `notebooks` MODIFY COLUMN `name` varchar(512) NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `folders` MODIFY COLUMN `name` varchar(512) NOT NULL',
    );
    const metadata = new DbMetadata(QUIX_SCHEMA, CURRENT_QUIX_SCHEMA_VERSION);
    const manager = queryRunner.manager;
    await manager.update(DbMetadata, {name: QUIX_SCHEMA}, metadata);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `notes` MODIFY COLUMN `name` varchar(64) NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `notebooks` MODIFY COLUMN `name` varchar(64) NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `folders` MODIFY COLUMN `name` varchar(64) NOT NULL',
    );
    const metadata = new DbMetadata(QUIX_SCHEMA, PREVIOUS_QUIX_SCHEMA);
    const manager = queryRunner.manager;
    await manager.update(DbMetadata, {name: QUIX_SCHEMA}, metadata);
  }
}
