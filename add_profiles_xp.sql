-- Create profiles table for Gamification
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  xp integer default 0,
  level integer default 1,
  updated_at timestamp with time zone
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Trigger to create profile on signup (optional but good)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql;

-- Trigger the function every time a user is created
-- (Note: you might need to run this part in Supabase dashboardSQL editor if you don't have triggers setup rights here, but the code helps)
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute procedure public.handle_new_user();
