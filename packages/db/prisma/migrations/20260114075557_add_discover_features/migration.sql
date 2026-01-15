-- AlterTable
ALTER TABLE `Category` ADD COLUMN `description` VARCHAR(500) NULL;

-- AlterTable
ALTER TABLE `Link` ADD COLUMN `likeCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `viewCount` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `LinkLike` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `linkId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `LinkLike_linkId_idx`(`linkId`),
    INDEX `LinkLike_userId_idx`(`userId`),
    UNIQUE INDEX `LinkLike_userId_linkId_key`(`userId`, `linkId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Link_isPublic_viewCount_idx` ON `Link`(`isPublic`, `viewCount`);

-- CreateIndex
CREATE INDEX `Link_isPublic_likeCount_idx` ON `Link`(`isPublic`, `likeCount`);

-- CreateIndex
CREATE INDEX `Link_isPublic_createdAt_idx` ON `Link`(`isPublic`, `createdAt`);

-- AddForeignKey
ALTER TABLE `LinkLike` ADD CONSTRAINT `LinkLike_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LinkLike` ADD CONSTRAINT `LinkLike_linkId_fkey` FOREIGN KEY (`linkId`) REFERENCES `Link`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
