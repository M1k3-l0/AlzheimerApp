-- Script di riparazione tabella TASKS
-- Esegui questo script in Supabase > SQL Editor se ricevi errori 400 aggiungendo attività

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category text DEFAULT 'generic';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurrence text DEFAULT 'none';

-- Assicuriamoci che le colonne esistenti abbiano i tipi corretti (opzionale)
-- ALTER TABLE tasks ALTER COLUMN completed SET DEFAULT false;
