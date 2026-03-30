ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS likes_count INTEGER NOT NULL DEFAULT 0;

UPDATE posts
SET likes_count = 0;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'post_likes'
  ) THEN
    UPDATE posts p
    SET likes_count = c.cnt
    FROM (
      SELECT post_id, COUNT(*)::INTEGER AS cnt
      FROM post_likes
      GROUP BY post_id
    ) c
    WHERE p.id = c.post_id;
  END IF;
END $$;
