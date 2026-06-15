-- SQL Update: Tabella Messaggi Privati

-- 1. Creazione Tabella
CREATE TABLE IF NOT EXISTS private_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE
);

-- 2. Abilitazione RLS
ALTER TABLE private_messages ENABLE ROW LEVEL SECURITY;

-- 3. Policy di Sicurezza
-- Gli utenti possono vedere solo i messaggi che hanno inviato o ricevuto
CREATE POLICY "Users can see own private messages" 
ON private_messages FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Gli utenti possono inviare messaggi solo come se stessi
CREATE POLICY "Users can insert own private messages" 
ON private_messages FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

-- Gli utenti possono segnare come letti i messaggi che hanno ricevuto
CREATE POLICY "Users can update own received messages" 
ON private_messages FOR UPDATE 
USING (auth.uid() = receiver_id);

-- 4. Indici per performance
CREATE INDEX IF NOT EXISTS idx_pm_sender ON private_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_pm_receiver ON private_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_pm_created_at ON private_messages(created_at);

-- 5. Abilitazione Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE private_messages;
