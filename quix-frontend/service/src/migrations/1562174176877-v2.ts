import {MigrationInterface, QueryRunner} from 'typeorm';
import {DbMetadata} from '../entities/version-metadata.entity';
import {QUIX_SCHEMA} from '../consts';
const PREVIOUS_QUIX_SCHEMA = 1;
const CURRENT_QUIX_SCHEMA_VERSION = 2;

export class v21562174176877 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'ALTER TABLE `users` ADD `date_updated` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)',
    );
    await queryRunner.query(
      'ALTER TABLE `users` ADD `date_created` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)',
    );

    await queryRunner.query(
      'DROP INDEX `IDX_22bc9f47a6d39a6c3a868321ba` ON `users`',
    );

    await queryRunner.query(
      'ALTER TABLE `users` DROP primary key, ADD primary key(`id`)',
    );

    const metadata = new DbMetadata(QUIX_SCHEMA, CURRENT_QUIX_SCHEMA_VERSION);
    const manager = queryRunner.manager;
    await manager.update(DbMetadata, {name: QUIX_SCHEMA}, metadata);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'ALTER TABLE `users` DROP primary key, ADD primary key(`id`, `root_folder`)',
    );

    await queryRunner.query(
      'CREATE UNIQUE INDEX `IDX_22bc9f47a6d39a6c3a868321ba` ON `users` (`root_folder`)',
    );
    await queryRunner.query('ALTER TABLE `users` DROP COLUMN `date_created`');
    await queryRunner.query('ALTER TABLE `users` DROP COLUMN `date_updated`');
    const metadata = new DbMetadata(QUIX_SCHEMA, PREVIOUS_QUIX_SCHEMA);
    const manager = queryRunner.manager;
    await manager.update(DbMetadata, {name: QUIX_SCHEMA}, metadata);
  }
}
