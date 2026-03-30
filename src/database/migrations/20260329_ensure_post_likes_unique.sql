DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'post_likes'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_indexes
      WHERE tablename = 'post_likes'
        AND indexdef ILIKE 'CREATE UNIQUE INDEX%'
        AND indexdef ILIKE '%(post_id, user_id)%'
    ) THEN
      ALTER TABLE post_likes
        ADD CONSTRAINT "UQ_post_likes_post_user" UNIQUE (post_id, user_id);
    END IF;
  END IF;
END $$;
