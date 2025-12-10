-- Create tasks table
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  duration_minutes integer default 30,
  is_scheduled boolean default false,
  start_time timestamp with time zone,
  status text default 'todo' check (status in ('todo', 'in-progress', 'done')),
  created_at timestamp with time zone default now(),
  finished_at timestamp with time zone
);

-- Enable RLS
alter table public.tasks enable row level security;

-- Policies
create policy "Users can view their own tasks" on public.tasks
  for select using (auth.uid() = user_id);

create policy "Users can insert their own tasks" on public.tasks
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own tasks" on public.tasks
  for update using (auth.uid() = user_id);

create policy "Users can delete their own tasks" on public.tasks
  for delete using (auth.uid() = user_id);

-- Functions and Triggers

CREATE OR REPLACE FUNCTION public.handle_task_finished()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'done' AND (OLD.status IS DISTINCT FROM 'done') THEN
    NEW.finished_at = now();
  ELSIF NEW.status != 'done' AND OLD.status = 'done' THEN
    NEW.finished_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_task_finished
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_task_finished();
