CREATE TABLE IF NOT EXISTS click_receipts (
  id TEXT PRIMARY KEY,
  day TEXT NOT NULL,
  page TEXT NOT NULL,
  action TEXT NOT NULL,
  source TEXT NOT NULL,
  test INTEGER NOT NULL CHECK(test IN (0,1))
);
CREATE INDEX IF NOT EXISTS click_receipts_day ON click_receipts(day);
CREATE TABLE IF NOT EXISTS daily_clicks (
  day TEXT NOT NULL,
  page TEXT NOT NULL,
  action TEXT NOT NULL,
  source TEXT NOT NULL,
  test INTEGER NOT NULL CHECK(test IN (0,1)),
  clicks INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(day, page, action, source, test)
);
CREATE TRIGGER IF NOT EXISTS count_public_click AFTER INSERT ON click_receipts
BEGIN
  INSERT INTO daily_clicks(day, page, action, source, test, clicks)
  VALUES(NEW.day, NEW.page, NEW.action, NEW.source, NEW.test, 1)
  ON CONFLICT(day, page, action, source, test) DO UPDATE SET clicks = clicks + 1;
END;
