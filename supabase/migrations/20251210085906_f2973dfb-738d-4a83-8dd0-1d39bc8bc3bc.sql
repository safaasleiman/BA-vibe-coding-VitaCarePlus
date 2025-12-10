-- Add gender column to children table
ALTER TABLE public.children 
ADD COLUMN gender text CHECK (gender IN ('male', 'female', 'diverse'));