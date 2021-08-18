import {MigrationInterface, QueryRunner} from "typeorm";

export class v5DeletedNotebooks1629275687000 implements MigrationInterface {
    name = 'v5DeletedNotebooks1629275687000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`quix\`.\`deleted_notebooks\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(512) NOT NULL, \`owner\` varchar(64) NOT NULL, \`date_updated\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`date_created\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`date_deleted\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`json_content\` json NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`DROP INDEX \`IDX_28d49fb1d1f565ea98929f69a0\` ON \`quix\`.\`actions\``);
        await queryRunner.query(`ALTER TABLE \`quix\`.\`actions\` CHANGE \`type\` \`type\` varchar(255) NOT NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_28d49fb1d1f565ea98929f69a0\` ON \`quix\`.\`actions\` (\`id\`, \`type\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_28d49fb1d1f565ea98929f69a0\` ON \`quix\`.\`actions\``);
        await queryRunner.query(`ALTER TABLE \`quix\`.\`actions\` CHANGE \`type\` \`type\` varchar(255) NOT NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_28d49fb1d1f565ea98929f69a0\` ON \`quix\`.\`actions\` (\`id\`, \`type\`)`);
        await queryRunner.query(`DROP TABLE \`quix\`.\`deleted_notebooks\``);
    }

}
