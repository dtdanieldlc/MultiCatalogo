// URL base de la API.
// - Desarrollo local: http://localhost:3000
// - Producción: definir VITE_API_URL al hacer el build, p. ej.
//   VITE_API_URL=https://multicatalogo-api.onrender.com
// Si no hay VITE_API_URL y el host es *.onrender.com, usa la API de Render conocida.

const fromEnv = import.meta.env.VITE_API_URL as string | undefined;

function resolveApiUrl(): string {
  if (fromEnv && fromEnv.length > 0) {
    return fromEnv.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    // Sitio estático en Render → API Go en Render
    if (host.endsWith(".onrender.com")) {
      return "https://multicatalogo-api.onrender.com";
    }
    return `http://${host}:3000`;
  }
  return "http://localhost:3000";
}

export const API_URL = resolveApiUrl();
