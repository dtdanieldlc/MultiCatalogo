// src/components/Registro.tsx — alta pública de clientes (+ código de referido)
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth, type Rol } from "../context/AuthContext";
import { API_URL } from "../config";
import AuthShell from "./AuthShell";
import { Alert } from "./ui";

const Registro = () => {
  const [params] = useSearchParams();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ref, setRef] = useState(params.get("ref") ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    fetch(`${API_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, password, ref: ref || undefined }),
    })
      .then(async (r) => {
        const data = await r.json().catch(() => null);
        if (!r.ok) throw new Error(data?.message ?? "Error al registrar");
        return data;
      })
      .then((data) => {
        const rol: Rol = data.rol === "admin" ? "admin" : "cliente";
        login({ email: data.email, rol, token: data.token });
        navigate(rol === "admin" ? "/" : "/tienda");
      })
      .catch((err) =>
        setError(err instanceof TypeError ? "No se pudo conectar con el servidor" : err.message)
      )
      .finally(() => setLoading(false));
  };

  return (
    <AuthShell title="Crea tu cuenta" subtitle="Únete a la red MultiCatálogo en menos de un minuto.">
      {error && <Alert>{error}</Alert>}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="nombre" className="label">Nombre</label>
          <input id="nombre" className="input" autoComplete="name" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="correo" className="label">Correo</label>
          <input id="correo" type="email" autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="clave" className="label">Contraseña</label>
          <input id="clave" type="password" autoComplete="new-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
          <p className="mt-1 text-xs text-ink-400">Mínimo 6 caracteres.</p>
        </div>
        <div>
          <label htmlFor="ref" className="label">Código de referido <span className="font-normal text-ink-400">(opcional)</span></label>
          <input id="ref" className="input" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Ej. LUIS" />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary w-full py-3.5">
          {loading ? "Creando…" : "Registrarme"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-500">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="font-semibold text-brand-700 hover:underline">Iniciar sesión</Link>
      </p>
    </AuthShell>
  );
};

export default Registro;
