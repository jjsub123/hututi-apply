-- Open-beta auth/RLS hardening for hututi-apply
-- Run this in the Supabase SQL editor after confirming posts/comments/user_coupons
-- only contain disposable test data.

begin;

truncate table public.comments restart identity cascade;
truncate table public.posts restart identity cascade;
truncate table public.user_coupons restart identity cascade;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'posts'
      and column_name = 'author_id'
      and data_type <> 'uuid'
  ) then
    execute 'alter table public.posts alter column author_id type uuid using nullif(author_id::text, '''')::uuid';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'comments'
      and column_name = 'author_id'
      and data_type <> 'uuid'
  ) then
    execute 'alter table public.comments alter column author_id type uuid using nullif(author_id::text, '''')::uuid';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_coupons'
      and column_name = 'user_id'
      and data_type <> 'uuid'
  ) then
    execute 'alter table public.user_coupons alter column user_id type uuid using nullif(user_id::text, '''')::uuid';
  end if;
end $$;

alter table public.waitlist enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.user_coupons enable row level security;

alter table public.waitlist force row level security;
alter table public.posts force row level security;
alter table public.comments force row level security;
alter table public.user_coupons force row level security;

drop policy if exists "waitlist_insert_public" on public.waitlist;
drop policy if exists "posts_select_authenticated" on public.posts;
drop policy if exists "posts_insert_own_author" on public.posts;
drop policy if exists "posts_update_own_author" on public.posts;
drop policy if exists "posts_delete_own_author" on public.posts;
drop policy if exists "comments_select_authenticated" on public.comments;
drop policy if exists "comments_insert_own_author" on public.comments;
drop policy if exists "comments_update_own_author" on public.comments;
drop policy if exists "comments_delete_own_author" on public.comments;
drop policy if exists "user_coupons_select_own" on public.user_coupons;

create policy "waitlist_insert_public"
on public.waitlist
for insert
to anon, authenticated
with check (coalesce(consent, false) = true);

create policy "posts_select_authenticated"
on public.posts
for select
to authenticated
using (true);

create policy "posts_insert_own_author"
on public.posts
for insert
to authenticated
with check (
  author_id = auth.uid()
  and author = coalesce(
    auth.jwt() -> 'user_metadata' ->> 'display_name',
    auth.jwt() ->> 'email'
  )
);

create policy "posts_update_own_author"
on public.posts
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

create policy "posts_delete_own_author"
on public.posts
for delete
to authenticated
using (author_id = auth.uid());

create policy "comments_select_authenticated"
on public.comments
for select
to authenticated
using (true);

create policy "comments_insert_own_author"
on public.comments
for insert
to authenticated
with check (
  author_id = auth.uid()
  and author = coalesce(
    auth.jwt() -> 'user_metadata' ->> 'display_name',
    auth.jwt() ->> 'email'
  )
);

create policy "comments_update_own_author"
on public.comments
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

create policy "comments_delete_own_author"
on public.comments
for delete
to authenticated
using (author_id = auth.uid());

create policy "user_coupons_select_own"
on public.user_coupons
for select
to authenticated
using (user_id = auth.uid());

commit;
