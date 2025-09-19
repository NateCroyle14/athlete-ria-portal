/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `SpendingTxn` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SpendingTxn" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_SpendingTxn" ("amount", "category", "createdAt", "date", "description", "id") SELECT "amount", "category", "createdAt", "date", "description", "id" FROM "SpendingTxn";
DROP TABLE "SpendingTxn";
ALTER TABLE "new_SpendingTxn" RENAME TO "SpendingTxn";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
