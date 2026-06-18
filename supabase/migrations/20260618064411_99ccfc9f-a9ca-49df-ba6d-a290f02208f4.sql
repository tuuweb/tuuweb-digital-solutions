DROP POLICY IF EXISTS "public read active sponsors" ON public.sponsor_gallery;
CREATE POLICY "public read active sponsors"
ON public.sponsor_gallery
FOR SELECT
TO anon, authenticated
USING (activo = true);

DROP POLICY IF EXISTS "public read active popups" ON public.promo_popups;
CREATE POLICY "public read active popups"
ON public.promo_popups
FOR SELECT
TO anon, authenticated
USING (activo = true);