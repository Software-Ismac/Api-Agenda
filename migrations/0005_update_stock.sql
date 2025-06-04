-- Instead of dropping directly, first disable FK checks
PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS UserAlbum;
DROP TABLE IF EXISTS AlbumImage;
DROP TABLE IF EXISTS Album;

PRAGMA foreign_keys = ON;
