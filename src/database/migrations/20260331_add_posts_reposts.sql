ALTER TABLE posts
ADD COLUMN IF NOT EXISTS original_post_id INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_posts_original_post'
  ) THEN
    ALTER TABLE posts
      ADD CONSTRAINT fk_posts_original_post
      FOREIGN KEY (original_post_id) REFERENCES posts(id)
      ON DELETE CASCADE;
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_posts_user_original_repost
ON posts(user_id, original_post_id)
WHERE original_post_id IS NOT NULL;
