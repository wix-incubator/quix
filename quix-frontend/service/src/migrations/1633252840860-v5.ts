import {MigrationInterface, QueryRunner} from 'typeorm';
import {DbMetadata} from '../entities/version-metadata.entity';
import {QUIX_SCHEMA} from '../consts';
const PREVIOUS_QUIX_SCHEMA = 4;
const CURRENT_QUIX_SCHEMA_VERSION = 5;

export class v51633252840860 implements MigrationInterface {
  name = 'v51633252840860';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`quix\`.\`notes\` DROP FOREIGN KEY \`FK_d84382f58ca053c3532fe78b05b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`quix\`.\`tree_nodes\` DROP FOREIGN KEY \`FK_88797ade322e1717a3824fa0eca\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`quix\`.\`tree_nodes\` DROP FOREIGN KEY \`FK_8aff7aa6aa930ffd5f259b27da7\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_88797ade322e1717a3824fa0ec\` ON \`quix\`.\`tree_nodes\``,
    );
    await queryRunner.query(
      `CREATE TABLE \`quix\`.\`deleted_notebooks\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(512) NOT NULL, \`owner\` varchar(64) NOT NULL, \`date_updated\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`date_created\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`date_deleted\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`json_content\` json NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    // await queryRunner.query(
    //   `ALTER TABLE \`quix\`.\`notes\` ADD \`rich_content\` json NULL`,
    // );
    // await queryRunner.query(
    //   `ALTER TABLE \`quix\`.\`notes\` DROP COLUMN \`name\``,
    // );
    // await queryRunner.query(
    //   `ALTER TABLE \`quix\`.\`notes\` ADD \`name\` varchar(512) NOT NULL`,
    // );
    // await queryRunner.query(
    //   `ALTER TABLE \`quix\`.\`notes\` CHANGE \`date_updated\` \`date_updated\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    // );
    // await queryRunner.query(
    //   `ALTER TABLE \`quix\`.\`users\` CHANGE \`date_updated\` \`date_updated\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    // );
    // await queryRunner.query(
    //   `ALTER TABLE \`quix\`.\`notebooks\` DROP COLUMN \`name\``,
    // );
    // await queryRunner.query(
    //   `ALTER TABLE \`quix\`.\`notebooks\` ADD \`name\` varchar(512) NOT NULL`,
    // );
    // await queryRunner.query(
    //   `ALTER TABLE \`quix\`.\`notebooks\` CHANGE \`date_updated\` \`date_updated\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    // );
    // await queryRunner.query(
    //   `ALTER TABLE \`quix\`.\`folders\` DROP COLUMN \`name\``,
    // );
    // await queryRunner.query(
    //   `ALTER TABLE \`quix\`.\`folders\` ADD \`name\` varchar(512) NOT NULL`,
    // );
    // await queryRunner.query(
    //   `ALTER TABLE \`quix\`.\`folders\` CHANGE \`date_updated\` \`date_updated\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    // );
    // await queryRunner.query(
    //   `ALTER TABLE \`quix\`.\`tree_nodes\` CHANGE \`date_updated\` \`date_updated\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    // );
    // await queryRunner.query(
    //   `DROP INDEX \`IDX_28d49fb1d1f565ea98929f69a0\` ON \`quix\`.\`actions\``,
    // );
    // await queryRunner.query(
    //   `ALTER TABLE \`quix\`.\`actions\` CHANGE \`type\` \`type\` varchar(255) NOT NULL`,
    // );
    // await queryRunner.query(
    //   `CREATE INDEX \`IDX_28d49fb1d1f565ea98929f69a0\` ON \`quix\`.\`actions\` (\`id\`, \`type\`)`,
    // );

    const manager = queryRunner.manager;
    await manager.update(
      DbMetadata,
      {name: QUIX_SCHEMA},
      {version: CURRENT_QUIX_SCHEMA_VERSION},
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // await queryRunner.query(
    //   `DROP INDEX \`IDX_28d49fb1d1f565ea98929f69a0\` ON \`quix\`.\`actions\``,
    // );
    // await queryRunner.query(
    //   `ALTER TABLE \`quix\`.\`actions\` CHANGE \`type\` \`type\` varchar(255) NOT NULL`,
    // );
    // await queryRunner.query(
    //   `CREATE INDEX \`IDX_28d49fb1d1f565ea98929f69a0\` ON \`quix\`.\`actions\` (\`id\`, \`type\`)`,
    // );
    // await queryRunner.query(
    //   `ALTER TABLE \`quix\`.\`tree_nodes\` CHANGE \`date_updated\` \`date_updated\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    // );
    // await queryRunner.query(
    //   `ALTER TABLE \`quix\`.\`folders\` CHANGE \`date_updated\` \`date_updated\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    // );
    // await queryRunner.query(
    //   `ALTER TABLE \`quix\`.\`folders\` DROP COLUMN \`name\``,
    // );
    // await queryRunner.query(
    //   `ALTER TABLE \`quix\`.\`folders\` ADD \`name\` varchar(64) NOT NULL`,
    // );
    // await queryRunner.query(
    //   `ALTER TABLE \`quix\`.\`notebooks\` CHANGE \`date_updated\` \`date_updated\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    // );
    // await queryRunner.query(
    //   `ALTER TABLE \`quix\`.\`notebooks\` DROP COLUMN \`name\``,
    // );
    // await queryRunner.query(
    //   `ALTER TABLE \`quix\`.\`notebooks\` ADD \`name\` varchar(64) NOT NULL`,
    // );
    // await queryRunner.query(
    //   `ALTER TABLE \`quix\`.\`users\` CHANGE \`date_updated\` \`date_updated\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    // );
    // await queryRunner.query(
    //   `ALTER TABLE \`quix\`.\`notes\` CHANGE \`date_updated\` \`date_updated\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    // );
    // await queryRunner.query(
    //   `ALTER TABLE \`quix\`.\`notes\` DROP COLUMN \`name\``,
    // );
    // await queryRunner.query(
    //   `ALTER TABLE \`quix\`.\`notes\` ADD \`name\` varchar(64) NOT NULL`,
    // );
    // await queryRunner.query(
    //   `ALTER TABLE \`quix\`.\`notes\` DROP COLUMN \`rich_content\``,
    // );
    await queryRunner.query(`DROP TABLE \`quix\`.\`deleted_notebooks\``);
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`REL_88797ade322e1717a3824fa0ec\` ON \`quix\`.\`tree_nodes\` (\`notebookId\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`quix\`.\`tree_nodes\` ADD CONSTRAINT \`FK_8aff7aa6aa930ffd5f259b27da7\` FOREIGN KEY (\`parentId\`) REFERENCES \`quix\`.\`tree_nodes\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`quix\`.\`tree_nodes\` ADD CONSTRAINT \`FK_88797ade322e1717a3824fa0eca\` FOREIGN KEY (\`notebookId\`) REFERENCES \`quix\`.\`notebooks\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
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
