ALTER TABLE posts
ADD COLUMN IF NOT EXISTS reposts_count INTEGER NOT NULL DEFAULT 0;

UPDATE posts p
SET reposts_count = sub.count
FROM (
  SELECT original_post_id, COUNT(*)::int AS count
  FROM posts
  WHERE original_post_id IS NOT NULL
  GROUP BY original_post_id
) AS sub
WHERE p.id = sub.original_post_id;
