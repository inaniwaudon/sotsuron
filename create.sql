CREATE TABLE user (
  id TEXT PRIMARY KEY,
  twitter TEXT,
  goal INTEGER NOT NULL,
  comment TEXT,
  token TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
  updated_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime'))
);

CREATE TRIGGER user_updated_at AFTER UPDATE ON user
BEGIN
  UPDATE user SET updated_at = DATETIME('now', 'localtime') WHERE rowid == NEW.rowid;
END;

CREATE TABLE progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  pages INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
  FOREIGN KEY (user_id) REFERENCES user(id) ON UPDATE SET NULL
)
