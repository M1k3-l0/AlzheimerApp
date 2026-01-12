-- Aggiungi colonna likes alla tabella comments
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS likes INT DEFAULT 0;

-- Policy per permettere l'update dei like ai commenti a tutti
CREATE POLICY "Allow All Comment Likes" ON comments FOR UPDATE USING (true);
