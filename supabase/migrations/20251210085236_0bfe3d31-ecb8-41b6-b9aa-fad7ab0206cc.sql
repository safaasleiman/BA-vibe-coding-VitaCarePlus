-- Update handle_new_user function to also save gender from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, gender)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'gender'
  );
  
  INSERT INTO public.reminder_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$function$;