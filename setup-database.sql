-- SQL Script per Setup Integrale Database Memora
-- Copia questo codice e incollalo in Supabase → SQL Editor → "New query"

-- 1. Tabella Utenti (Profilo opzionale per persistenza DB)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  name TEXT,
  surname TEXT,
  photo_url TEXT,
  last_online TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabella Messages (Chat in tempo reale)
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  text TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_id TEXT NOT NULL -- Usiamo il nome o un ID per semplicità locale
);

-- 3. Tabella Posts (MemoraBook / Feed Social)
CREATE TABLE IF NOT EXISTS posts (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  author TEXT NOT NULL,
  text TEXT,
  image TEXT, -- Salvataggio Base64 ottimizzato
  likes INT DEFAULT 0
);

-- ABILITA RLS (Row Level Security)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- POLICY PER MESSAGGI
DROP POLICY IF EXISTS "Public Read Messages" ON messages;
CREATE POLICY "Public Read Messages" ON messages FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert Messages" ON messages;
CREATE POLICY "Public Insert Messages" ON messages FOR INSERT WITH CHECK (true);

-- POLICY PER POST
DROP POLICY IF EXISTS "Public Read Posts" ON posts;
CREATE POLICY "Public Read Posts" ON posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert Posts" ON posts;
CREATE POLICY "Public Insert Posts" ON posts FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Update Posts" ON posts;
CREATE POLICY "Public Update Posts" ON posts FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public Delete Posts" ON posts;
CREATE POLICY "Public Delete Posts" ON posts FOR DELETE USING (true);

-- POLICY PER PROFILI
DROP POLICY IF EXISTS "Public Read Profiles" ON profiles;
CREATE POLICY "Public Read Profiles" ON profiles FOR SELECT USING (true);
