-- CHOIRGRID auth.users -> public.users profile trigger
-- What it does:
-- When Supabase Auth creates a user, this automatically creates the matching
-- public.users row using the same UUID, so fetchProfileAndMembership(auth.uid()) works.

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone text;
  v_full_name text;
  v_display_name text;
  v_language text;
BEGIN
  v_phone := NEW.raw_user_meta_data->>'phone_e164';
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown User');
  v_display_name := COALESCE(NEW.raw_user_meta_data->>'display_name', v_full_name);
  v_language := COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'sw');

  IF v_phone IS NULL OR v_phone = '' THEN
    RAISE EXCEPTION 'phone_e164 metadata is required to create public.users profile';
  END IF;

  INSERT INTO public.users (
    id,
    phone,
    email,
    full_name,
    display_name,
    preferred_language
  )
  VALUES (
    NEW.id,
    v_phone,
    NEW.email,
    v_full_name,
    v_display_name,
    v_language
  )
  ON CONFLICT (id) DO UPDATE
  SET
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    display_name = EXCLUDED.display_name,
    preferred_language = EXCLUDED.preferred_language,
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_create_public_profile ON auth.users;

CREATE TRIGGER on_auth_user_created_create_public_profile
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_auth_user();
