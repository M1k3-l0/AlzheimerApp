-- SQL Update: Tabella Seguiti (Follows)

-- 1. Creazione Tabella
CREATE TABLE IF NOT EXISTS follows (
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  followed_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, followed_id)
);

-- 2. Abilitazione RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- 3. Policy di Sicurezza
-- Chiunque può vedere chi segue chi
CREATE POLICY "Public follows are viewable by everyone" 
ON follows FOR SELECT USING (true);

-- Un utente può seguire/smettere di seguire solo per se stesso
CREATE POLICY "Users can manage own follows" 
ON follows FOR ALL 
USING (auth.uid() = follower_id);

-- 4. Indici
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_followed ON follows(followed_id);
