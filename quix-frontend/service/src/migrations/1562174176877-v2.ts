import {MigrationInterface, QueryRunner} from "typeorm";

export class v21562174176877 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `users` ADD `date_updated` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `users` ADD `date_created` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `version_metadata` CHANGE `version` `version` double NOT NULL");
        await queryRunner.query("DROP INDEX `IDX_28d49fb1d1f565ea98929f69a0` ON `actions`");
        await queryRunner.query("ALTER TABLE `actions` CHANGE `type` `type` varchar(255) NOT NULL");
        await queryRunner.query("CREATE INDEX `IDX_28d49fb1d1f565ea98929f69a0` ON `actions` (`id`, `type`)");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("DROP INDEX `IDX_28d49fb1d1f565ea98929f69a0` ON `actions`");
        await queryRunner.query("ALTER TABLE `actions` CHANGE `type` `type` varchar(255) NOT NULL");
        await queryRunner.query("CREATE INDEX `IDX_28d49fb1d1f565ea98929f69a0` ON `actions` (`id`, `type`)");
        await queryRunner.query("ALTER TABLE `version_metadata` CHANGE `version` `version` double(22) NOT NULL");
        await queryRunner.query("ALTER TABLE `users` DROP COLUMN `date_created`");
        await queryRunner.query("ALTER TABLE `users` DROP COLUMN `date_updated`");
    }

}
