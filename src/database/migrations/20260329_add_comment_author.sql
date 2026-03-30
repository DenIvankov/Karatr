DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'comment'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comment' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE comment ADD COLUMN user_id INTEGER;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comment' AND column_name = 'user_id'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.table_constraints
      WHERE table_name = 'comment'
        AND constraint_name = 'fk_comment_user_id'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
      ALTER TABLE comment
        ADD CONSTRAINT fk_comment_user_id
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_indexes
      WHERE tablename = 'comment'
        AND indexname = 'idx_comment_user_id'
    ) THEN
      CREATE INDEX idx_comment_user_id ON comment(user_id);
    END IF;
  END IF;
END $$;
