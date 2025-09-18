/*
  Warnings:

  - The primary key for the `SpendingTxn` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `amount` on the `SpendingTxn` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - Made the column `body` on table `Alert` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Alert" ("body", "createdAt", "id", "level", "read", "title") SELECT "body", "createdAt", "id", "level", "read", "title" FROM "Alert";
DROP TABLE "Alert";
ALTER TABLE "new_Alert" RENAME TO "Alert";
CREATE TABLE "new_SpendingTxn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_SpendingTxn" ("amount", "category", "createdAt", "date", "description", "id") SELECT "amount", "category", "createdAt", "date", "description", "id" FROM "SpendingTxn";
DROP TABLE "SpendingTxn";
ALTER TABLE "new_SpendingTxn" RENAME TO "SpendingTxn";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
