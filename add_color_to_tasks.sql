-- Add color column to tasks table
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS color text DEFAULT 'blue';
