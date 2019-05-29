/* tslint:disable */
import {MigrationInterface, QueryRunner} from "typeorm";

export class v11558528771647 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("CREATE TABLE `folders` (`id` varchar(36) NOT NULL, `name` varchar(64) NOT NULL, `owner` varchar(64) NOT NULL, `date_updated` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `date_created` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `json_content` json NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `tree_nodes` (`id` varchar(36) NOT NULL, `owner` varchar(64) NOT NULL, `date_updated` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `date_created` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `type` enum ('folder', 'notebook') NOT NULL DEFAULT 'folder', `parentId` varchar(255) NULL, `notebookId` varchar(255) NULL, `mpath` varchar(1024) NULL, `folderId` varchar(36) NULL, INDEX `IDX_8954b75175bd5cbc43630e1c52` (`owner`), UNIQUE INDEX `REL_88797ade322e1717a3824fa0ec` (`notebookId`), UNIQUE INDEX `REL_cf0b457e67294f4b1155568441` (`folderId`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `notebooks` (`id` varchar(36) NOT NULL, `name` varchar(64) NOT NULL, `owner` varchar(64) NOT NULL, `date_updated` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `date_created` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `json_content` json NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `notes` (`id` varchar(36) NOT NULL, `json_content` json NULL, `textContent` mediumtext NULL, `type` varchar(64) NOT NULL, `name` varchar(64) NOT NULL, `owner` varchar(64) NOT NULL, `date_updated` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `date_created` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `notebookId` varchar(255) NOT NULL, `rank` int NOT NULL, FULLTEXT INDEX `IDX_5c83f1c4e3f3db5ea424438946` (`textContent`), INDEX `IDX_8e91b277f0f9ca503d8bf88390` (`owner`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `favorites` (`owner` varchar(64) NOT NULL, `entity_id` varchar(36) NOT NULL, `entity_type` enum ('notebook', 'note', 'folder') NOT NULL DEFAULT 'notebook', INDEX `IDX_e42953e6be13870839a04a3fa8` (`entity_id`), PRIMARY KEY (`owner`, `entity_id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `users` (`id` varchar(64) NOT NULL, `name` varchar(64) NULL, `avatar` varchar(255) NULL, `root_folder` varchar(36) NOT NULL, `json_content` json NULL, UNIQUE INDEX `IDX_22bc9f47a6d39a6c3a868321ba` (`root_folder`), PRIMARY KEY (`id`, `root_folder`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `version_metadata` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `version` double NOT NULL, `jsonContent` json NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `actions` (`id` varchar(36) NOT NULL, `data` json NULL, `user` varchar(64) NOT NULL, `date_created` timestamp(4) NOT NULL DEFAULT CURRENT_TIMESTAMP(4), `type` varchar(255) NOT NULL, INDEX `IDX_733a22dda689fe10e5fa29d93f` (`date_created`), INDEX `IDX_28d49fb1d1f565ea98929f69a0` (`id`, `type`), PRIMARY KEY (`id`, `date_created`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `tree_nodes` ADD CONSTRAINT `FK_8aff7aa6aa930ffd5f259b27da7` FOREIGN KEY (`parentId`) REFERENCES `tree_nodes`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `tree_nodes` ADD CONSTRAINT `FK_88797ade322e1717a3824fa0eca` FOREIGN KEY (`notebookId`) REFERENCES `notebooks`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `tree_nodes` ADD CONSTRAINT `FK_cf0b457e67294f4b11555684416` FOREIGN KEY (`folderId`) REFERENCES `folders`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `notes` ADD CONSTRAINT `FK_d84382f58ca053c3532fe78b05b` FOREIGN KEY (`notebookId`) REFERENCES `notebooks`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `notes` DROP FOREIGN KEY `FK_d84382f58ca053c3532fe78b05b`");
        await queryRunner.query("ALTER TABLE `tree_nodes` DROP FOREIGN KEY `FK_cf0b457e67294f4b11555684416`");
        await queryRunner.query("ALTER TABLE `tree_nodes` DROP FOREIGN KEY `FK_88797ade322e1717a3824fa0eca`");
        await queryRunner.query("ALTER TABLE `tree_nodes` DROP FOREIGN KEY `FK_8aff7aa6aa930ffd5f259b27da7`");
        await queryRunner.query("DROP INDEX `IDX_28d49fb1d1f565ea98929f69a0` ON `actions`");
        await queryRunner.query("DROP INDEX `IDX_733a22dda689fe10e5fa29d93f` ON `actions`");
        await queryRunner.query("DROP TABLE `actions`");
        await queryRunner.query("DROP TABLE `version_metadata`");
        await queryRunner.query("DROP INDEX `IDX_22bc9f47a6d39a6c3a868321ba` ON `users`");
        await queryRunner.query("DROP TABLE `users`");
        await queryRunner.query("DROP INDEX `IDX_e42953e6be13870839a04a3fa8` ON `favorites`");
        await queryRunner.query("DROP TABLE `favorites`");
        await queryRunner.query("DROP INDEX `IDX_8e91b277f0f9ca503d8bf88390` ON `notes`");
        await queryRunner.query("DROP INDEX `IDX_5c83f1c4e3f3db5ea424438946` ON `notes`");
        await queryRunner.query("DROP TABLE `notes`");
        await queryRunner.query("DROP TABLE `notebooks`");
        await queryRunner.query("DROP INDEX `REL_cf0b457e67294f4b1155568441` ON `tree_nodes`");
        await queryRunner.query("DROP INDEX `REL_88797ade322e1717a3824fa0ec` ON `tree_nodes`");
        await queryRunner.query("DROP INDEX `IDX_8954b75175bd5cbc43630e1c52` ON `tree_nodes`");
        await queryRunner.query("DROP TABLE `tree_nodes`");
        await queryRunner.query("DROP TABLE `folders`");
    }

}
