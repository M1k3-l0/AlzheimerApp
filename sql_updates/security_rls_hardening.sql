-- Memora: hardening RLS (eseguire in Supabase SQL Editor)
-- Sostituisce policy permissive USING (true) con regole basate su auth.uid()

-- ─── PROFILES ───────────────────────────────────────────────────────────────
alter table profiles enable row level security;

drop policy if exists "Public Profiles" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;

create policy "profiles_select_authenticated"
  on profiles for select to authenticated
  using (true);

create policy "profiles_insert_own"
  on profiles for insert to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ─── POSTS ──────────────────────────────────────────────────────────────────
alter table posts enable row level security;

drop policy if exists "Public Posts" on posts;

create policy "posts_select_authenticated"
  on posts for select to authenticated using (true);

create policy "posts_insert_own"
  on posts for insert to authenticated
  with check (auth.uid()::text = author_id);

create policy "posts_update_own"
  on posts for update to authenticated
  using (auth.uid()::text = author_id);

create policy "posts_delete_own_or_admin"
  on posts for delete to authenticated
  using (
    auth.uid()::text = author_id
    or exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'super_admin', 'moderator')
    )
  );

-- ─── COMMENTS ─────────────────────────────────────────────────────────────────
alter table comments enable row level security;

drop policy if exists "Public Comments" on comments;

create policy "comments_select_authenticated"
  on comments for select to authenticated using (true);

create policy "comments_insert_own"
  on comments for insert to authenticated
  with check (auth.uid()::text = author_id);

create policy "comments_update_own"
  on comments for update to authenticated
  using (auth.uid()::text = author_id);

create policy "comments_delete_own_or_admin"
  on comments for delete to authenticated
  using (
    auth.uid()::text = author_id
    or exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'super_admin', 'moderator')
    )
  );

-- ─── MESSAGES (chat gruppo) ───────────────────────────────────────────────────
alter table messages enable row level security;

drop policy if exists "Public Messages" on messages;

create policy "messages_select_authenticated"
  on messages for select to authenticated using (true);

create policy "messages_insert_own"
  on messages for insert to authenticated
  with check (auth.uid()::text = sender_id);

-- ─── TASKS ────────────────────────────────────────────────────────────────────
alter table tasks enable row level security;

drop policy if exists "tasks_all" on tasks;

create policy "tasks_select_own_or_caregiver"
  on tasks for select to authenticated
  using (
    auth.uid()::text = user_id
    or exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role in ('caregiver', 'healthcare', 'admin', 'super_admin')
    )
  );

create policy "tasks_insert_own"
  on tasks for insert to authenticated
  with check (auth.uid()::text = user_id);

create policy "tasks_update_own"
  on tasks for update to authenticated
  using (auth.uid()::text = user_id);

-- ─── MOOD HISTORY ─────────────────────────────────────────────────────────────
alter table mood_history enable row level security;

drop policy if exists "mood_history_all" on mood_history;

create policy "mood_history_select_scoped"
  on mood_history for select to authenticated
  using (
    auth.uid()::text = user_id
    or exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role in ('caregiver', 'healthcare', 'admin', 'super_admin')
    )
  );

create policy "mood_history_insert_own"
  on mood_history for insert to authenticated
  with check (auth.uid()::text = user_id);

-- ─── STORAGE: avatars ─────────────────────────────────────────────────────────
-- Eseguire solo se bucket 'avatars' esiste
-- create policy "avatars_upload_own" on storage.objects for insert to authenticated
--   with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- NOTA: verificare tipi UUID vs text su author_id/sender_id/user_id prima di applicare.
-- Ruoli admin: promuovere utenti solo via service role o dashboard Supabase, non da signup metadata.
