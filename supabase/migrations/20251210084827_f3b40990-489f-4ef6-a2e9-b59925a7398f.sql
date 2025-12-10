-- Add gender column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN gender text CHECK (gender IN ('male', 'female', 'diverse'));

-- Create check_ups table for adult preventive care
CREATE TABLE public.check_ups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  check_up_type text NOT NULL,
  due_date date NOT NULL,
  actual_date date,
  doctor_name text,
  notes text,
  interval_months integer NOT NULL DEFAULT 12,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.check_ups ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own check_ups" 
ON public.check_ups 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own check_ups" 
ON public.check_ups 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own check_ups" 
ON public.check_ups 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own check_ups" 
ON public.check_ups 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_check_ups_updated_at
BEFORE UPDATE ON public.check_ups
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();