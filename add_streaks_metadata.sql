-- Add streak tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_active_date DATE;

-- Function to update streak (can be called from client or trigger, we'll do client for now for simplicity/gamification feedback)
-- Logic: 
-- If last_active_date == today: no change
-- If last_active_date == yesterday: streak++, last_active_date = today
-- If last_active_date < yesterday: streak = 1, last_active_date = today
-- If last_active_date is null: streak = 1, last_active_date = today
