-- Create children table
CREATE TABLE public.children (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

-- RLS policies for children
CREATE POLICY "Users can view own children"
ON public.children
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own children"
ON public.children
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own children"
ON public.children
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own children"
ON public.children
FOR DELETE
USING (auth.uid() = user_id);

-- Create u_examinations table
CREATE TABLE public.u_examinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  examination_type TEXT NOT NULL, -- U1, U2, U3, etc.
  due_date DATE NOT NULL,
  actual_date DATE,
  doctor_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.u_examinations ENABLE ROW LEVEL SECURITY;

-- RLS policies for u_examinations
CREATE POLICY "Users can view own u_examinations"
ON public.u_examinations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own u_examinations"
ON public.u_examinations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own u_examinations"
ON public.u_examinations
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own u_examinations"
ON public.u_examinations
FOR DELETE
USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_children_updated_at
BEFORE UPDATE ON public.children
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_u_examinations_updated_at
BEFORE UPDATE ON public.u_examinations
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();