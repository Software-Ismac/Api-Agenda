-- AlterTable
ALTER TABLE "Note" ADD COLUMN "updated" DATETIME;

-- CreateTable
CREATE TABLE "Album" (
    "albumId" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "AlbumImage" (
    "albumId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,

    PRIMARY KEY ("albumId", "imageId"),
    CONSTRAINT "AlbumImage_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album" ("albumId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AlbumImage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image" ("imageId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserAlbum" (
    "userId" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,

    PRIMARY KEY ("userId", "albumId"),
    CONSTRAINT "UserAlbum_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserAlbum_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album" ("albumId") ON DELETE RESTRICT ON UPDATE CASCADE
);
