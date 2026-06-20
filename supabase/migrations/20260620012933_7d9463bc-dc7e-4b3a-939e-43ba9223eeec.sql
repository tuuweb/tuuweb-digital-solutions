CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, updated_at)
  VALUES (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();

  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_password_ok(_password text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
  SELECT encode(digest(coalesce(_password, ''), 'sha256'), 'hex') = '7439518ffdfb61a5b8095c3764217d0a24e31f74c70ebe0e204cc7d83adc1ea6'
$$;

CREATE OR REPLACE FUNCTION public.admin_assert_password(_password text)
RETURNS void
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.admin_password_ok(_password) THEN
    RAISE EXCEPTION 'Contraseña incorrecta';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_allowed_table(_table text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT _table = ANY (ARRAY[
    'sold_projects',
    'sponsor_gallery',
    'promo_popups',
    'site_content',
    'trusted_brands',
    'physical_products',
    'directory_recommendations',
    'hero_slides',
    'support_messages'
  ])
$$;

CREATE OR REPLACE FUNCTION public.admin_read_table(_password text, _table text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  PERFORM public.admin_assert_password(_password);
  IF NOT public.admin_allowed_table(_table) THEN
    RAISE EXCEPTION 'Tabla no permitida';
  END IF;

  EXECUTE format('SELECT coalesce(jsonb_agg(to_jsonb(t)), ''[]''::jsonb) FROM public.%I t', _table)
  INTO result;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_insert_row(_password text, _table text, _payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  PERFORM public.admin_assert_password(_password);
  IF NOT public.admin_allowed_table(_table) THEN
    RAISE EXCEPTION 'Tabla no permitida';
  END IF;

  EXECUTE format('INSERT INTO public.%I SELECT * FROM jsonb_populate_record(NULL::public.%I, $1) RETURNING to_jsonb(%I.*)', _table, _table, _table)
  USING _payload
  INTO result;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_row(_password text, _table text, _id uuid, _payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  PERFORM public.admin_assert_password(_password);
  IF NOT public.admin_allowed_table(_table) THEN
    RAISE EXCEPTION 'Tabla no permitida';
  END IF;

  EXECUTE format('UPDATE public.%I AS target SET %s FROM jsonb_populate_record(NULL::public.%I, $1) AS patch WHERE target.id = $2 RETURNING to_jsonb(target.*)',
    _table,
    (
      SELECT string_agg(format('%I = patch.%I', key, key), ', ')
      FROM jsonb_object_keys(_payload) AS key
      WHERE key <> 'id'
    ),
    _table
  )
  USING _payload, _id
  INTO result;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_row(_password text, _table text, _id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count int;
BEGIN
  PERFORM public.admin_assert_password(_password);
  IF NOT public.admin_allowed_table(_table) THEN
    RAISE EXCEPTION 'Tabla no permitida';
  END IF;

  EXECUTE format('DELETE FROM public.%I WHERE id = $1', _table)
  USING _id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN deleted_count > 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_upsert_site_content(_password text, _key text, _value text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  PERFORM public.admin_assert_password(_password);

  INSERT INTO public.site_content (key, value, updated_at)
  VALUES (_key, _value, now())
  ON CONFLICT (key) DO UPDATE SET
    value = excluded.value,
    updated_at = now()
  RETURNING to_jsonb(site_content.*) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_password_ok(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_assert_password(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_allowed_table(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_read_table(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_insert_row(text, text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_update_row(text, text, uuid, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_delete_row(text, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_upsert_site_content(text, text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.admin_password_ok(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_read_table(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_insert_row(text, text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_row(text, text, uuid, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_row(text, text, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upsert_site_content(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_assert_password(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_allowed_table(text) TO service_role;