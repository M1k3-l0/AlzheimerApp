-- ABILITAZIONE AUTENTICAZIONE SICURA CON SYNC PROFILI

-- 1. Assicuriamoci che la tabella profiles sia pronta
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY, -- Collegamento diretto all'utente Auth
  email TEXT,
  name TEXT,
  surname TEXT,
  photo_url TEXT,
  role TEXT DEFAULT 'patient', -- patient, caregiver, healthcare
  last_online TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Funzione Trigger: Eseguita ogni volta che un utente si iscrive
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, surname, role, photo_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'surname',
    COALESCE(new.raw_user_meta_data->>'role', 'caregiver'), -- Default ruolo
    new.raw_user_meta_data->>'photo_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attivazione Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Aggiornamento Policies per Profili (Ora basate sull'ID utente vero)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Chiunque può LEGGERE i profili (per vederli nella chat o nei post)
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Solo l'utente stesso può MODIFICARE il proprio profilo
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
