PRAGMA foreign_keys = ON;

CREATE TABLE users(
userid TEXT PRIMARY KEY,
firstName TEXT NOT NULL,
lastName TEXT NOT NULL,
email TEXT NOT NULL UNIQUE,
password TEXT NOT NULL,
grade INTEGER NOT NULL DEFAULT 0 CHECK((grade BETWEEN 9 AND 12) OR grade = 0 OR grade = -1),
userType TEXT NOT NULL CHECK(userType = "student" OR userType = "teacher" OR userType = "admin"),
profilePicture TEXT DEFAULT "noimg",
generalAccessLevel INTEGER NOT NULL DEFAULT 0 CHECK(generalAccessLevel BETWEEN 0 AND 4)
);

CREATE TABLE refresh(
issueat INTEGER NOT NULL,
sessionid TEXT NOT NULL,
userid TEXT NOT NULL UNIQUE,
FOREIGN KEY (userid) REFERENCES users (userid)
);