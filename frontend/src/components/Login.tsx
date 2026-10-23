// src/components/Login.tsx
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, type Rol } from "../context/AuthContext";
import { API_URL } from "../config";
import InstallPwaButton from "./InstallPwaButton";
import AuthShell from "./AuthShell";
import { Alert, Icon } from "./ui";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setError("Sin conexión. El inicio de sesión requiere red.");
      return;
    }
    setLoading(true);

    // Consumo de API RESTful usando promesas (Tema 4)
    fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then(async (response) => {
        // La API devuelve errores con formato estandarizado: { status, message, details }
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(data?.message ?? "Error inesperado del servidor");
        }
        return data;
      })
      .then((data) => {
        setError("");
        const rol: Rol = data.rol === "admin" ? "admin" : "cliente";
        login({ email: data.email, rol, token: data.token });
        navigate(rol === "admin" ? "/" : "/tienda");
      })
      .catch((err) => {
        // TypeError = el navegador no pudo contactar al servidor (caído, CORS, red)
        setError(
          err instanceof TypeError
            ? "No se pudo conectar con el servidor"
            : err.message
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const rellenar = (correo: string) => {
    setEmail(correo);
    setPassword("123456");
    setError("");
  };

  return (
    <AuthShell title="Qué bueno verte de nuevo" subtitle="Ingresa a tu cuenta para continuar.">
      <div className="mb-6">
        <InstallPwaButton variant="login" />
      </div>

      {error && <Alert>{error}</Alert>}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="email" className="label">Correo electrónico</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="tucorreo@ejemplo.com"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="label">Contraseña</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="••••••"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary w-full py-3.5">
          {loading ? "Validando…" : "Iniciar sesión"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        ¿No tienes cuenta?{" "}
        <Link to="/registro" className="font-semibold text-brand-700 hover:underline">
          Crear cuenta
        </Link>
      </p>

      <div className="mt-8 rounded-2xl border border-dashed border-ink-200 bg-white/60 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-500">Cuentas de prueba</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={() => rellenar("admin@upse.edu.ec")} className="btn btn-outline btn-sm justify-start">
            <Icon name="sparkles" className="h-4 w-4 text-brand-600" /> Administrador
          </button>
          <button type="button" onClick={() => rellenar("cliente@upse.edu.ec")} className="btn btn-outline btn-sm justify-start">
            <Icon name="bag" className="h-4 w-4 text-brand-600" /> Cliente
          </button>
        </div>
        <p className="mt-2 text-xs text-ink-400">Toca una para rellenar el formulario (clave 123456).</p>
      </div>
    </AuthShell>
  );
};

export default Login;
