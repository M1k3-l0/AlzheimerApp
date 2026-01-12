-- ESEGUI QUESTO SCRIPT NELL'EDITOR SQL DI SUPABASE PER ATTIVARE I LIKE SUI COMMENTI

-- 1. Aggiungi la colonna likes alla tabella comments
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS likes INT DEFAULT 0;

-- 2. Aggiorna la policy per permettere a tutti di modificare i like dei commenti
-- (Nota: in setup-database.sql abbiamo "FOR ALL USING (true)", che copre già questo caso se è attiva,
-- ma per sicurezza permettiamo esplicitamente l'update se le policy sono restrittive)

-- Verifica sicura: se esiste una policy che blocca, questo assicura che l'update funzioni
CREATE POLICY "Allow Comment Likes Update" ON comments FOR UPDATE USING (true) WITH CHECK (true);
