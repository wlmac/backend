PRAGMA foreign_keys = ON;

CREATE TABLE users(
userid TEXT PRIMARY KEY,
firstname TEXT NOT NULL,
lastname TEXT NOT NULL,
email TEXT NOT NULL UNIQUE,
password TEXT NOT NULL,
gradyear INTEGER NOT NULL DEFAULT 0 CHECK(gradyear > 2020 OR gradyear = -1),
usertype TEXT NOT NULL DEFAULT "student" CHECK(usertype = "student" OR usertype = "teacher" OR usertype = "admin"),
profilepicture TEXT DEFAULT "noimg",
generalaccesslevel INTEGER NOT NULL DEFAULT 0 CHECK(generalaccesslevel BETWEEN -1 AND 4)
);

CREATE TABLE refresh(
issueat INTEGER NOT NULL,
sessionid TEXT NOT NULL,
userid TEXT NOT NULL UNIQUE,
FOREIGN KEY (userid) REFERENCES users (userid)
);

CREATE TABLE verify(
code TEXT PRIMARY KEY,
issueat INTEGER NOT NULL,
userid TEXT NOT NULL UNIQUE,
FOREIGN KEY (userid) REFERENCES users (userid)
)
