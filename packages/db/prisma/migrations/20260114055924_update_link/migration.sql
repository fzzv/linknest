-- AlterTable
ALTER TABLE `Link` ADD COLUMN `isPublic` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `Link_isPublic_updatedAt_idx` ON `Link`(`isPublic`, `updatedAt`);
