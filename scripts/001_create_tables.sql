-- Create profiles table for user management
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create activities table for storing activity types
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  points_per_unit integer not null,
  unit text not null,
  icon_emoji text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create activity logs for user activities
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  activity_id uuid not null references public.activities(id) on delete cascade,
  amount decimal(10, 2) not null,
  points_earned integer not null,
  notes text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create leaderboard view for rankings
create materialized view if not exists public.leaderboard as
select 
  p.id,
  p.username,
  p.full_name,
  p.avatar_url,
  coalesce(sum(al.points_earned), 0)::integer as total_points,
  count(al.id)::integer as activity_count,
  max(al.created_at) as last_activity_at
from public.profiles p
left join public.activity_logs al on p.id = al.user_id
group by p.id, p.username, p.full_name, p.avatar_url
order by total_points desc;

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.activities enable row level security;
alter table public.activity_logs enable row level security;

-- Profiles policies
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id or true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Activities policies (public read)
create policy "activities_select" on public.activities for select using (true);

-- Activity logs policies
create policy "activity_logs_select_own" on public.activity_logs for select using (auth.uid() = user_id or false);
create policy "activity_logs_insert_own" on public.activity_logs for insert with check (auth.uid() = user_id);
create policy "activity_logs_update_own" on public.activity_logs for update using (auth.uid() = user_id);
create policy "activity_logs_delete_own" on public.activity_logs for delete using (auth.uid() = user_id);

-- Create trigger to auto-create profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Insert default activities
insert into public.activities (name, points_per_unit, unit, icon_emoji) values
  ('Running', 10, 'km', '🏃'),
  ('Walking', 5, 'km', '🚶'),
  ('Cycling', 8, 'km', '🚴'),
  ('Swimming', 15, 'km', '🏊'),
  ('Gym Workout', 20, 'session', '💪'),
  ('Yoga', 12, 'session', '🧘'),
  ('Sports', 25, 'game', '⚽'),
  ('Hiking', 12, 'km', '⛰️')
on conflict do nothing;
