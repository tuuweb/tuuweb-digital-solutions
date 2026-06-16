## Resumen de cambios

Vamos a transformar el sitio: ya no habrá login para usuarios finales (todo va por WhatsApp +57 333 273 2672), y el panel `/admin-emanuel` se vuelve el único lugar con autenticación, usando tus credenciales fijas. Además añadimos tracker de proyectos vendidos, galería de patrocinadores gestionable y sistema de popups promocionales.

---

### 1. Autenticación: solo para admin

- **Eliminar** la página pública `/auth`, los botones "Iniciar sesión" en header/menú móvil y el contexto de usuario en componentes públicos.
- **`/admin-emanuel`** pedirá email + contraseña. Validación exclusiva contra:
  - email: `emanueldavxd@gmail.com`
  - password: `55249964paola`
- El acceso se hace con `supabase.auth.signInWithPassword` (creamos ese usuario una sola vez en la base de datos). Solo ese user_id tendrá el rol `admin`. Sesión persistida en localStorage de Supabase.
- Quitar Google OAuth y formulario de registro del front.

### 2. Todo lleva a WhatsApp

- Reemplazar cualquier "Comprar / Iniciar sesión / Mi cuenta" por **"Cotizar por WhatsApp"** apuntando a `wa.me/573332732672` con mensaje pre-llenado según el contexto.
- **Modal de producto / servicio**: al hacer clic en una carta de la tienda o en un plan de página web, se abre un `Dialog` con:
  - Imagen, título, descripción, precio.
  - Botón grande "Cotizar por WhatsApp" con mensaje tipo `Hola, me interesa "<nombre>" ($<precio>)`.
- Quitar carrito, formularios de pedido y rutas relacionadas.

### 3. Carrusel "Todo lo que tu negocio necesita"

- Reescribir `PokerCardsCarousel` para que las mismas cartas se deslicen **horizontalmente y de forma suave e infinita** (auto-scroll continuo + drag/swipe manual), sin efecto de "cayendo".
- En móvil: una carta visible con snap; en desktop: 2-3 visibles desplazándose suavemente.

### 4. Nueva galería de patrocinados (debajo del hero)

- Tabla nueva `sponsor_gallery` (título, descripción, imagen, link, activo, orden).
- Sección pública `SponsorGallery` que solo se renderiza si hay items activos.
- En admin: CRUD + switch "Mostrar en la página".

### 5. Popups / avisos promocionales

- Tabla nueva `promo_popups` (título, mensaje, código opcional, imagen opcional, activo, fechas inicio/fin, frecuencia: una vez por sesión / siempre).
- Componente `PromoPopup` global que consulta el popup activo más reciente y lo muestra como modal en la home.
- Admin: crear/editar/activar/desactivar popups.

### 6. Tracker de proyectos vendidos (basado en tu Excel)

Reemplazar la tabla existente `sold_projects` con todas las columnas de tu Excel:

```
cliente, dominio, tipo_pagina, estado_proyecto, estado_pagina, cotizacion_cop,
proveedor_dominio, correo_dominio, fecha_renovacion_dominio,
proveedor_hosting, correo_hosting, telefono_hosting, fecha_renovacion_hosting,
base_datos, correo_bd,
ia_usada, correo_ia,
notas
```

- Días para renovar se calculan en el front (no se guardan).
- Vista en admin: tabla con filtros, edición inline / dialog, badges de estado, indicador rojo si faltan <30 días para renovar.
- Botón **"Exportar a Excel"** que descarga `.xlsx` con todas las columnas (usando `xlsx` o `exceljs` en el cliente).
- Resumen arriba: total proyectos, ingresos totales, próximas renovaciones.

### 7. Admin general

El panel `/admin-emanuel` queda con pestañas:
- **Proyectos vendidos** (tracker + export Excel)
- **Tienda** (productos físicos)
- **Servicios Web** (planes/precios editables)
- **Hero / Carrusel principal** (slides)
- **Marcas de confianza** (logos)
- **Galería de patrocinados** (nuevo)
- **Popups promocionales** (nuevo)
- **Mensajes de soporte / WhatsApp leads**
- **Secciones y textos** (títulos, descripciones de cada sección de la home — tabla `site_content` clave/valor)

### 8. Cambios técnicos clave

- Migración SQL: crear `sponsor_gallery`, `promo_popups`, `site_content`; rehacer `sold_projects` con las columnas del Excel; sembrar el usuario admin y asignarle rol `admin`.
- Quitar `Auth.tsx` de las rutas y todos los `useAuth()` en componentes públicos.
- `AuthContext` se simplifica: solo expone `adminSession` para `/admin-emanuel`.
- Añadir librería `xlsx` (SheetJS) para exportar.

### 9. Archivos a tocar (resumen)

- `src/App.tsx` — quitar ruta `/auth`.
- `src/components/layout/Header.tsx` y `Footer.tsx` — quitar login, dejar WhatsApp.
- `src/contexts/AuthContext.tsx` — simplificar a admin-only.
- `src/pages/AdminEmanuel.tsx` — login email+password contra Supabase.
- `src/pages/Admin.tsx` — pestañas nuevas (tracker, sponsors, popups, site_content).
- `src/components/PokerCardsCarousel.tsx` — auto-scroll horizontal infinito.
- `src/components/SponsorGallery.tsx` *(nuevo)*.
- `src/components/PromoPopup.tsx` *(nuevo)*.
- `src/components/ProductQuoteDialog.tsx` *(nuevo)* — modal con "Cotizar por WhatsApp".
- `src/pages/Tienda.tsx`, `src/pages/ServiciosWeb.tsx` — abrir el dialog en lugar de carrito/login.
- `src/pages/Home.tsx` — montar `SponsorGallery` y `PromoPopup`.
- Migración SQL única con todas las tablas, grants, RLS y seed del admin.

---

¿Apruebo y empiezo? Si quieres ajustar algo (por ejemplo qué pestañas del admin priorizar, o si el popup debe poder mostrarse en TODAS las páginas y no solo home), dímelo antes de aplicar.