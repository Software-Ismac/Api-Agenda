-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Code";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Chat";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Draw";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Share" (
    "userId" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,

    PRIMARY KEY ("userId", "noteId"),
    CONSTRAINT "Share_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Share_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note" ("noteId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Image" (
    "imageId" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "uri" TEXT NOT NULL,
    "created" DATETIME,
    CONSTRAINT "Image_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Image" ("created", "imageId", "name", "size", "type", "uri", "userId") SELECT "created", "imageId", "name", "size", "type", "uri", "userId" FROM "Image";
DROP TABLE "Image";
ALTER TABLE "new_Image" RENAME TO "Image";
CREATE TABLE "new_Note" (
    "noteId" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "name" TEXT,
    "created" DATETIME,
    CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Note" ("created", "name", "note", "noteId", "userId") SELECT "created", "name", "note", "noteId", "userId" FROM "Note";
DROP TABLE "Note";
ALTER TABLE "new_Note" RENAME TO "Note";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
