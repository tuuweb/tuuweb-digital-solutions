CREATE OR REPLACE FUNCTION public.admin_password_ok(_password text)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path TO 'public','extensions' AS $$
  SELECT encode(extensions.digest(coalesce(_password,''),'sha256'),'hex') = '48f4b1592bb51f8f77ca28a5c5bf635398effc8fe4a1f5600e1fd34dfedc43ae'
$$;