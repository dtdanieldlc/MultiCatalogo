// URL base de la API.
// - Desarrollo local: http://localhost:3000 (o el hostname de la máquina)
// - Producción (Railway/Vercel): definir VITE_API_URL al hacer el build
//   ej. VITE_API_URL=https://multicatalogo-api.up.railway.app
const fromEnv = import.meta.env.VITE_API_URL as string | undefined;

export const API_URL =
  fromEnv && fromEnv.length > 0
    ? fromEnv.replace(/\/$/, "")
    : `http://${typeof window !== "undefined" ? window.location.hostname : "localhost"}:3000`;
