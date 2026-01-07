-- 1. Tabella Commenti
CREATE TABLE IF NOT EXISTS comments (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_photo TEXT,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Abilita Sicurezza
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 3. Policy Pubblica per i test
DROP POLICY IF EXISTS "Public Comments" ON comments;
CREATE POLICY "Public Comments" ON comments FOR ALL USING (true);
