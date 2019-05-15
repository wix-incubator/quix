import {MigrationInterface, QueryRunner} from "typeorm";

export class v11557677851645 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("CREATE TABLE `db_folder` (`id` varchar(255) NOT NULL, `name` tinytext NOT NULL, `owner` tinytext NOT NULL, `dateUpdated` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `dateCreated` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `db_file_tree_node` (`id` varchar(255) NOT NULL, `owner` varchar(255) NOT NULL, `dateUpdated` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `dateCreated` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `type` enum ('folder', 'notebook') NOT NULL DEFAULT 'folder', `parentId` varchar(255) NULL, `notebookId` varchar(255) NULL, `mpath` varchar(1024) NULL, `folderId` varchar(255) NULL, INDEX `IDX_bfe63d2d0a6433b5b1f6260172` (`owner`), UNIQUE INDEX `REL_50faedd03ebb15a4e8fe1fb34e` (`notebookId`), UNIQUE INDEX `REL_f1eaaa9c944bba9e76ecb0a57c` (`folderId`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `db_notebook` (`id` varchar(255) NOT NULL, `name` tinytext NOT NULL, `owner` tinytext NOT NULL, `dateUpdated` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `dateCreated` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `jsonContent` json NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `db_note` (`id` varchar(255) NOT NULL, `jsonContent` json NOT NULL, `textContent` mediumtext NULL, `type` tinytext NOT NULL, `name` tinytext NOT NULL, `owner` tinytext NOT NULL, `dateUpdated` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `dateCreated` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `notebookId` varchar(255) NOT NULL, `rank` int NOT NULL, FULLTEXT INDEX `IDX_f4f40ab68e1992cb2036274a65` (`textContent`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `version_metadata` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `version` int NOT NULL, `jsonContent` json NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `db_file_tree_node` ADD CONSTRAINT `FK_1be8b6770fac9809767eb087129` FOREIGN KEY (`parentId`) REFERENCES `db_file_tree_node`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `db_file_tree_node` ADD CONSTRAINT `FK_50faedd03ebb15a4e8fe1fb34e0` FOREIGN KEY (`notebookId`) REFERENCES `db_notebook`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `db_file_tree_node` ADD CONSTRAINT `FK_f1eaaa9c944bba9e76ecb0a57c0` FOREIGN KEY (`folderId`) REFERENCES `db_folder`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `db_note` ADD CONSTRAINT `FK_4362257ff91f75fd16296760d06` FOREIGN KEY (`notebookId`) REFERENCES `db_notebook`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `db_note` DROP FOREIGN KEY `FK_4362257ff91f75fd16296760d06`");
        await queryRunner.query("ALTER TABLE `db_file_tree_node` DROP FOREIGN KEY `FK_f1eaaa9c944bba9e76ecb0a57c0`");
        await queryRunner.query("ALTER TABLE `db_file_tree_node` DROP FOREIGN KEY `FK_50faedd03ebb15a4e8fe1fb34e0`");
        await queryRunner.query("ALTER TABLE `db_file_tree_node` DROP FOREIGN KEY `FK_1be8b6770fac9809767eb087129`");
        await queryRunner.query("DROP TABLE `version_metadata`");
        await queryRunner.query("DROP INDEX `IDX_f4f40ab68e1992cb2036274a65` ON `db_note`");
        await queryRunner.query("DROP TABLE `db_note`");
        await queryRunner.query("DROP TABLE `db_notebook`");
        await queryRunner.query("DROP INDEX `REL_f1eaaa9c944bba9e76ecb0a57c` ON `db_file_tree_node`");
        await queryRunner.query("DROP INDEX `REL_50faedd03ebb15a4e8fe1fb34e` ON `db_file_tree_node`");
        await queryRunner.query("DROP INDEX `IDX_bfe63d2d0a6433b5b1f6260172` ON `db_file_tree_node`");
        await queryRunner.query("DROP TABLE `db_file_tree_node`");
        await queryRunner.query("DROP TABLE `db_folder`");
    }

}
