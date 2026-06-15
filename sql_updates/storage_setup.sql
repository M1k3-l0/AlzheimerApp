-- Script per configurare lo storage di Supabase per le foto profilo

-- 1. Crea il bucket 'avatars' se non esiste (impostandolo come pubblico)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Elimina eventuali policy pre-esistenti per evitare conflitti (opzionale ma consigliato)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Delete" ON storage.objects;

-- 3. Policy per l'accesso pubblico in lettura
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- 4. Policy per l'upload (inserimento) da parte di chiunque (per semplicità, può essere raffinata in base all'auth)
CREATE POLICY "Allow Public Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'avatars' );

-- 5. Policy per l'aggiornamento (update) dei file esistenti
CREATE POLICY "Allow Public Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'avatars' );

-- 6. Policy per l'eliminazione dei file (opzionale)
CREATE POLICY "Allow Public Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'avatars' );
