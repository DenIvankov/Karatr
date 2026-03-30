ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS comments_count INTEGER NOT NULL DEFAULT 0;

UPDATE posts
SET comments_count = 0;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'comment'
  ) THEN
    UPDATE posts p
    SET comments_count = c.cnt
    FROM (
      SELECT post_id, COUNT(*)::INTEGER AS cnt
      FROM comment
      GROUP BY post_id
    ) c
    WHERE p.id = c.post_id;
  END IF;
END $$;
