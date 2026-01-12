-- SQL Script per Setup Database Memora (VERSIONE CORRETTA E COMPLETA)

-- 1. Pulizia tabelle esistenti (con CASCADE per i commenti)
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. Tabella Profili
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  name TEXT,
  surname TEXT,
  photo_url TEXT,
  role TEXT, -- Aggiunto ruolo per supportare le nuove funzionalità
  bio TEXT,  -- Aggiunto bio
  location TEXT, -- Aggiunto location
  last_online TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabella Messaggi
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  text TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_id TEXT NOT NULL
);

-- 4. Tabella Posts
CREATE TABLE posts (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  author TEXT NOT NULL,
  author_photo TEXT,
  text TEXT,
  image TEXT,
  likes INT DEFAULT 0
);

-- 5. Tabella Commenti
CREATE TABLE comments (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_photo TEXT,
  text TEXT NOT NULL,
  likes INT DEFAULT 0, -- Colonna Likes aggiunta
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Abilitazione RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 7. Policy Pubbliche (Permettono lettura e scrittura a tutti senza Auth email)
CREATE POLICY "Allow All Messages" ON messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Posts" ON posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Comments" ON comments FOR ALL USING (true) WITH CHECK (true);

-- Policy specifica aggiuntiva per garantire l'aggiornamento dei Like sui commenti
CREATE POLICY "Allow Comment Likes Update" ON comments FOR UPDATE USING (true) WITH CHECK (true);

-- 8. Indici per performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);

-- 9. Abilitazione Realtime
-- Esegui queste righe una alla volta se ricevi errore nel 'New Query' editor di Supabase
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
