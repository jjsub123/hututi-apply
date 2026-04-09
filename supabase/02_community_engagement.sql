-- Community engagement persistence for mock posts and real posts
-- Run after 01_auth_hardening.sql

begin;

create extension if not exists pgcrypto;

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_key text not null,
  author text not null,
  author_id uuid not null,
  content text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_key text not null,
  user_id uuid not null,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists post_likes_post_key_user_id_idx
  on public.post_likes (post_key, user_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.community_comments to authenticated;
grant select, insert, delete on public.post_likes to authenticated;

alter table public.community_comments enable row level security;
alter table public.post_likes enable row level security;

alter table public.community_comments force row level security;
alter table public.post_likes force row level security;

drop policy if exists "community_comments_select_authenticated" on public.community_comments;
drop policy if exists "community_comments_insert_own_author" on public.community_comments;
drop policy if exists "community_comments_update_own_author" on public.community_comments;
drop policy if exists "community_comments_delete_own_author" on public.community_comments;
drop policy if exists "post_likes_select_authenticated" on public.post_likes;
drop policy if exists "post_likes_insert_own_user" on public.post_likes;
drop policy if exists "post_likes_delete_own_user" on public.post_likes;

create policy "community_comments_select_authenticated"
on public.community_comments
for select
to authenticated
using (true);

create policy "community_comments_insert_own_author"
on public.community_comments
for insert
to authenticated
with check (
  author_id = auth.uid()
  and author = coalesce(
    auth.jwt() -> 'user_metadata' ->> 'display_name',
    auth.jwt() ->> 'email'
  )
);

create policy "community_comments_update_own_author"
on public.community_comments
for update
to authenticated
using (author_id = auth.uid())
with check (
  author_id = auth.uid()
  and author = coalesce(
    auth.jwt() -> 'user_metadata' ->> 'display_name',
    auth.jwt() ->> 'email'
  )
);

create policy "community_comments_delete_own_author"
on public.community_comments
for delete
to authenticated
using (author_id = auth.uid());

create policy "post_likes_select_authenticated"
on public.post_likes
for select
to authenticated
using (true);

create policy "post_likes_insert_own_user"
on public.post_likes
for insert
to authenticated
with check (user_id = auth.uid());

create policy "post_likes_delete_own_user"
on public.post_likes
for delete
to authenticated
using (user_id = auth.uid());

commit;
