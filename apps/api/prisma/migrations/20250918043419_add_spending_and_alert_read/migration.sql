/*
  Warnings:

  - The primary key for the `Alert` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `body` on the `Alert` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `Alert` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Alert` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `Alert` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `SpendingTxn` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `amount` on the `SpendingTxn` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Float`.
  - You are about to alter the column `id` on the `SpendingTxn` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - Added the required column `updatedAt` to the `SpendingTxn` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Alert" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "message" TEXT NOT NULL DEFAULT '',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Alert" ("createdAt", "id", "read") SELECT "createdAt", "id", "read" FROM "Alert";
DROP TABLE "Alert";
ALTER TABLE "new_Alert" RENAME TO "Alert";
CREATE TABLE "new_SpendingTxn" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SpendingTxn" ("amount", "category", "createdAt", "date", "description", "id") SELECT "amount", "category", "createdAt", "date", "description", "id" FROM "SpendingTxn";
DROP TABLE "SpendingTxn";
ALTER TABLE "new_SpendingTxn" RENAME TO "SpendingTxn";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
