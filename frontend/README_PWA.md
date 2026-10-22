# MultiCatálogo — PWA (HITO G)

## Qué incluye
- **Manifest** (`name`, iconos 192/512, `display: standalone`, `theme_color` indigo)
- **Service Worker** vía `vite-plugin-pwa` + Workbox
- **Precache** del shell (HTML/JS/CSS/iconos)
- **Runtime:** `GET /api/productos` → NetworkFirst (30 min); imágenes → SWR
- **No se cachean** login, register, checkout ni rutas admin de escritura
- Banner **Sin conexión**, toast de **nueva versión**, botón **Instalar app** (Chrome/Edge)

## Cómo probar
```bash
cd frontend
npm install
npm run build
npm run preview
```
Abre la URL de preview (no uses solo `npm run dev` para validar el SW).

Chrome DevTools → **Application**:
1. Manifest (nombre + iconos)
2. Service Workers (activated)
3. Lighthouse → categoría PWA

## Limitaciones
- iOS Safari: no hay `beforeinstallprompt`; “Añadir a pantalla de inicio” es manual.
- Login / checkout / admin **requieren red**.
- Producción: el frontend debe servirse por **HTTPS** (excepto localhost).
