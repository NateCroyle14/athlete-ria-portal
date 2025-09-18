/*
  Warnings:

  - You are about to drop the `Contract` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DutyDay` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SpendingTxn` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaxRate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VaultFile` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `Alert` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `detail` on the `Alert` table. All the data in the column will be lost.
  - You are about to drop the column `severity` on the `Alert` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Alert` table. All the data in the column will be lost.
  - You are about to drop the column `when` on the `Alert` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "TaxRate_state_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Contract";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "DutyDay";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SpendingTxn";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TaxRate";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "VaultFile";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "level" TEXT NOT NULL DEFAULT 'info',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Alert" ("id", "read", "title") SELECT "id", "read", "title" FROM "Alert";
DROP TABLE "Alert";
ALTER TABLE "new_Alert" RENAME TO "Alert";
CREATE INDEX "Alert_read_createdAt_idx" ON "Alert"("read", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
