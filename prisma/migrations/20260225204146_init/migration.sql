-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "expiresAt" DATETIME,
    "category" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
