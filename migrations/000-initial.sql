PRAGMA foreign_keys = ON;

CREATE TABLE users(
userid TEXT PRIMARY KEY,
firstName TEXT NOT NULL,
lastName TEXT NOT NULL,
email TEXT NOT NULL UNIQUE,
password TEXT NOT NULL,
gradyear INTEGER NOT NULL DEFAULT 0 CHECK(gradyear > 2020 OR grade = -1),
userType TEXT NOT NULL DEFAULT "student" CHECK(userType = "student" OR userType = "teacher" OR userType = "admin"),
profilePicture TEXT DEFAULT "noimg",
generalAccessLevel INTEGER NOT NULL DEFAULT 0 CHECK(generalAccessLevel BETWEEN -1 AND 4)
);

CREATE TABLE refresh(
issueat INTEGER NOT NULL,
sessionid TEXT NOT NULL,
userid TEXT NOT NULL UNIQUE,
FOREIGN KEY (userid) REFERENCES users (userid)
);