-- Add optional child_id to vaccinations table
ALTER TABLE public.vaccinations 
ADD COLUMN child_id uuid REFERENCES public.children(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_vaccinations_child_id ON public.vaccinations(child_id);

-- Add comment to explain the column
COMMENT ON COLUMN public.vaccinations.child_id IS 'Optional reference to a child. If NULL, vaccination is for the user themselves.';