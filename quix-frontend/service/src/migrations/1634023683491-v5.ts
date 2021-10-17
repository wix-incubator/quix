import {DbMetadata} from '../entities/version-metadata.entity';
import {MigrationInterface, QueryRunner} from 'typeorm';
import {QUIX_SCHEMA} from '../consts';
const PREVIOUS_QUIX_SCHEMA = 4;
const CURRENT_QUIX_SCHEMA_VERSION = 5;
export class v51634023683491 implements MigrationInterface {
  name = 'v51634023683491';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`quix\`.\`notes\` DROP FOREIGN KEY \`FK_d84382f58ca053c3532fe78b05b\``,
    );

    await queryRunner.query(
      `CREATE TABLE \`quix\`.\`deleted_notebooks\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(512) NOT NULL, \`owner\` varchar(64) NOT NULL, \`date_updated\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`date_created\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`date_deleted\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`json_content\` json NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );

    const manager = queryRunner.manager;
    await manager.update(
      DbMetadata,
      {name: QUIX_SCHEMA},
      {version: CURRENT_QUIX_SCHEMA_VERSION},
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`quix\`.\`deleted_notebooks\``);
    await queryRunner.query(
      `ALTER TABLE \`quix\`.\`notes\` ADD CONSTRAINT \`FK_d84382f58ca053c3532fe78b05b\` FOREIGN KEY (\`notebookId\`) REFERENCES \`quix\`.\`notebooks\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    const manager = queryRunner.manager;
    await manager.update(
      DbMetadata,
      {name: QUIX_SCHEMA},
      {version: PREVIOUS_QUIX_SCHEMA},
    );
  }
}
