-- SQL Script Master: Setup Database Memora con Auth e Trigger Utenti

-- 1. Pulizia tabelle esistenti (Reset Completo)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. Tabella Profili (Collegata a Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY, -- Collegamento diretto all'utente autenticato
  email TEXT,
  name TEXT,
  surname TEXT,
  photo_url TEXT,
  role TEXT DEFAULT 'caregiver',
  bio TEXT,
  location TEXT,
  last_online TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabella Messaggi
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  text TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_id UUID REFERENCES profiles(id), -- Ora collegato al profilo vero
  sender_display_id TEXT -- Per compatibilità se serve visualizzare ID stringa
);

-- 4. Tabella Posts
CREATE TABLE posts (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  author_id UUID REFERENCES profiles(id), -- Collegato all'autore vero
  author TEXT NOT NULL, -- Nome visualizzato (denormalizzato per velocità)
  author_photo TEXT,
  text TEXT,
  image TEXT,
  likes INT DEFAULT 0
);

-- 5. Tabella Commenti
CREATE TABLE comments (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id), -- Collegato all'autore vero
  author_name TEXT NOT NULL,
  author_photo TEXT,
  text TEXT NOT NULL,
  likes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Trigger per Creazione Automatica Profilo (Auth Hook)
-- Questa funzione viene eseguita automaticamente ogni volta che un utente si registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, surname, role, photo_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'surname',
    COALESCE(new.raw_user_meta_data->>'role', 'caregiver'),
    new.raw_user_meta_data->>'photo_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. Abilitazione RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 8. Policy di Sicurezza (Aperte per facilitare lo sviluppo, restringibili in futuro)

-- PROFILI
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
-- Importante: Permetti insert anche al trigger di sistema
CREATE POLICY "System can create profiles" ON profiles FOR INSERT WITH CHECK (true);

-- MESSAGGI, POSTS, COMMENTI (Lettura pubblica, Scrittura per utenti autenticati)
CREATE POLICY "Allow Public Read Messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Allow Public Read Posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Allow Public Read Comments" ON comments FOR SELECT USING (true);

-- Permettiamo insert, ma idealmente dovremmo controllare che auth.uid() corrisponda all'autore
-- Per ora, per evitare blocchi nel frontend, usiamo una policy aperta per INSERT
CREATE POLICY "Allow Insert All" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Insert Posts" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Insert Comments" ON comments FOR INSERT WITH CHECK (true);

-- Policy specifica per aggiornare i like (Update)
CREATE POLICY "Allow Update Posts" ON posts FOR UPDATE USING (true);
CREATE POLICY "Allow Update Comments" ON comments FOR UPDATE USING (true);

-- 9. Indici
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);

-- 10. Abilitazione Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
