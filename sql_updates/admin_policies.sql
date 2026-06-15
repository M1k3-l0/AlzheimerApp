-- SCRIPT PER ABILITARE LA GESTIONE ADMIN E IL SISTEMA DI BAN
-- Esegui questo script nel SQL Editor di Supabase

-- 1. Aggiungi la colonna is_banned alla tabella profiles (se non esiste)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;

-- 2. Rendi esplicito il ruolo 'admin' (facoltativo, ma utile per documentazione)
COMMENT ON COLUMN public.profiles.role IS 'Ruoli: patient, caregiver, healthcare, moderator, admin';

-- 3. Aggiorna le Policy RLS per la tabella profiles
-- Rimuoviamo prima le vecchie policy di update se esistono
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- Policy: Gli utenti possono sempre modificare il proprio profilo
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- Policy: Gli Admin possono modificare TUTTI i profili
-- Nota: Usiamo una condizione che non causa ricorsione infinita
CREATE POLICY "Admins can update any profile" ON public.profiles
FOR UPDATE USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 4. Assicuriamoci che anche i Moderatori possano cancellare Post/Commenti (Policy già esistenti di solito sono aperte, ma per sicurezza...)
DROP POLICY IF EXISTS "Moderators can delete any post" ON public.posts;
CREATE POLICY "Moderators can delete any post" ON public.posts
FOR DELETE USING (
  auth.uid() = author_id OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator')
);

DROP POLICY IF EXISTS "Moderators can delete any comment" ON public.comments;
CREATE POLICY "Moderators can delete any comment" ON public.comments
FOR DELETE USING (
  auth.uid() = author_id OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator')
);

-- 5. Indice per velocizzare i controlli sui ban
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON public.profiles(is_banned);
