DROP FUNCTION IF EXISTS public.admin_read_table(text, text);
DROP FUNCTION IF EXISTS public.admin_insert_row(text, text, jsonb);
DROP FUNCTION IF EXISTS public.admin_update_row(text, text, uuid, jsonb);
DROP FUNCTION IF EXISTS public.admin_delete_row(text, text, uuid);
DROP FUNCTION IF EXISTS public.admin_upsert_site_content(text, text, text);
DROP FUNCTION IF EXISTS public.admin_assert_password(text);
DROP FUNCTION IF EXISTS public.admin_allowed_table(text);