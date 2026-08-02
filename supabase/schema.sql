-- Nook Marketplace — initial schema
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query → Run).
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE throughout.

-- ============================================================
-- PROFILES
-- One row per authenticated user, created automatically on signup.
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  picture_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are publicly readable" on public.profiles;
create policy "Profiles are publicly readable"
  on public.profiles for select
  to anon, authenticated
  using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Lets the client self-heal an account whose profile row is missing (e.g. it
-- signed up before this trigger existed) by upserting its own row directly.
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

-- Auto-create a profile row whenever a new auth user signs up.
-- SECURITY DEFINER is required here (the trigger runs before the user has a
-- session), but the function only ever inserts a row scoped to NEW.id, so it
-- can't be used to write arbitrary data.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, picture_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.email),
    new.email,
    new.raw_user_meta_data ->> 'picture'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- LISTINGS
-- ============================================================
-- owner_id references profiles (not auth.users directly) so PostgREST can
-- embed the owner's profile in listing queries via a normal foreign-key join
-- (`profiles!listings_owner_id_fkey(...)`). profiles.id already cascades from
-- auth.users, so this still ends up scoped to a real authenticated user.
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  address text not null,
  neighbourhood text not null,
  type text not null check (type in ('Apartment', 'Condo', 'Loft', 'House', 'Studio')),
  unit_size text not null,
  baths integer not null check (baths > 0),
  sqft integer,
  price_monthly integer not null check (price_monthly > 0),
  rating numeric not null default 0,
  reviews integer not null default 0,
  tags text[] not null default '{}',
  photos jsonb not null default '[]',
  available text not null,
  favorite boolean not null default false,
  description text not null,
  pet_policy text,
  lease_term text,
  created_at timestamptz not null default now()
);

create index if not exists listings_owner_id_idx on public.listings (owner_id);

alter table public.listings enable row level security;

drop policy if exists "Listings are publicly readable" on public.listings;
create policy "Listings are publicly readable"
  on public.listings for select
  to anon, authenticated
  using (true);

drop policy if exists "Owners can insert their own listings" on public.listings;
create policy "Owners can insert their own listings"
  on public.listings for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

drop policy if exists "Owners can update their own listings" on public.listings;
create policy "Owners can update their own listings"
  on public.listings for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists "Owners can delete their own listings" on public.listings;
create policy "Owners can delete their own listings"
  on public.listings for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

-- ============================================================
-- REQUESTS (renter leads on a listing)
-- ============================================================
create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  name text not null,
  email text not null,
  message text,
  created_at timestamptz not null default now()
);

create index if not exists requests_listing_id_idx on public.requests (listing_id);

alter table public.requests enable row level security;

-- Anyone (including signed-out renters) can send a request.
drop policy if exists "Anyone can send a request" on public.requests;
create policy "Anyone can send a request"
  on public.requests for insert
  to anon, authenticated
  with check (true);

-- Only the listing's owner can see the requests that came in for it.
drop policy if exists "Owners can view requests on their listings" on public.requests;
create policy "Owners can view requests on their listings"
  on public.requests for select
  to authenticated
  using (
    exists (
      select 1 from public.listings
      where listings.id = requests.listing_id
        and listings.owner_id = (select auth.uid())
    )
  );

-- ============================================================
-- STORAGE — listing photos
-- ============================================================
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

drop policy if exists "Listing photos are publicly readable" on storage.objects;
create policy "Listing photos are publicly readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'listing-photos');

-- Owners upload into a folder named after their own user id:
-- listing-photos/<auth.uid()>/<filename>
drop policy if exists "Users can upload to their own folder" on storage.objects;
create policy "Users can upload to their own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can update files in their own folder" on storage.objects;
create policy "Users can update files in their own folder"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can delete files in their own folder" on storage.objects;
create policy "Users can delete files in their own folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
