// /admin/usuarios — listado de usuarios (solo admin) + activar/desactivar
import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError } from "../services/http";
import { Alert, EmptyState, Icon, PageHeader, PageLoading, money } from "./ui";

interface UsuarioAdmin {
  id: number;
  email: string;
  rol: string;
  nombre: string;
  activo: boolean;
  referidoId?: number;
  codigoRef?: string;
  creadoEn: string;
  pedidos: number;
  totalComprado: number;
}

interface Pagina {
  data: UsuarioAdmin[];
  page: number;
  limit: number;
  total: number;
}

const ROLES = ["", "admin", "cliente"];

const AdminUsuarios = () => {
  const [pagina, setPagina] = useState<Pagina | null>(null);
  const [q, setQ] = useState("");
  const [rol, setRol] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  const cargar = useCallback(
    async (busqueda = q, filtroRol = rol) => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ page: "1", limit: "50" });
        if (busqueda.trim()) params.set("q", busqueda.trim());
        if (filtroRol) params.set("rol", filtroRol);
        const raw = await apiFetch<Pagina | UsuarioAdmin[]>(`/api/admin/usuarios?${params}`);
        // Soporta { data, total } o array plano
        if (Array.isArray(raw)) {
          setPagina({ data: raw, page: 1, limit: raw.length, total: raw.length });
        } else if (raw && Array.isArray((raw as Pagina).data)) {
          setPagina(raw as Pagina);
        } else {
          setPagina({ data: [], page: 1, limit: 50, total: 0 });
          setError("Respuesta inesperada del servidor");
        }
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Error al cargar usuarios");
      } finally {
        setLoading(false);
      }
    },
    [q, rol]
  );

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const setActivo = async (id: number, activo: boolean) => {
    if (!activo) {
      const ok = window.confirm(
        "¿Desactivar esta cuenta? El usuario no podrá iniciar sesión."
      );
      if (!ok) return;
    }
    setBusyId(id);
    setError("");
    try {
      await apiFetch(`/api/admin/usuarios/${id}/activo`, {
        method: "PATCH",
        body: JSON.stringify({ activo }),
      });
      await cargar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo actualizar el usuario");
    } finally {
      setBusyId(null);
    }
  };

  const lista = pagina?.data ?? [];

  return (
    <div>
      <PageHeader
        eyebrow="Administración"
        title="Usuarios"
        subtitle={
          loading
            ? "Cargando…"
            : `${pagina?.total ?? 0} usuario(s) en total`
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Icon
            name="search"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
          />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre o email…"
            className="input rounded-full pl-11"
            aria-label="Buscar usuarios"
          />
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {ROLES.map((r) => (
            <button
              key={r || "todos"}
              type="button"
              onClick={() => setRol(r)}
              className={`chip capitalize ${rol === r ? "chip-active" : ""}`}
            >
              {r || "Todos"}
            </button>
          ))}
        </div>
      </div>

      {error && <Alert>{error}</Alert>}

      {loading ? (
        <PageLoading />
      ) : lista.length === 0 ? (
        <EmptyState
          icon="users"
          title="No hay usuarios"
          text="No se encontraron usuarios con ese filtro."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-ink-100 bg-sand/60 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Red</th>
                <th className="px-4 py-3">Pedidos</th>
                <th className="px-4 py-3">Comprado</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Alta</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-ink-50 last:border-0 hover:bg-sand/40"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900">
                      {u.nombre || "—"}
                    </p>
                    <p className="text-xs text-ink-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`badge ${
                        u.rol === "admin"
                          ? "bg-gold-100 text-gold-700"
                          : "bg-brand-100 text-brand-700"
                      }`}
                    >
                      {u.rol}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-600">
                    {u.codigoRef || "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-700">{u.pedidos}</td>
                  <td className="px-4 py-3 font-medium text-ink-800">
                    {money(u.totalComprado)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`badge ${
                        u.activo
                          ? "bg-leaf-100 text-leaf-700"
                          : "bg-ink-100 text-ink-500"
                      }`}
                    >
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-500">
                    {u.creadoEn
                      ? new Date(u.creadoEn).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={busyId === u.id}
                      onClick={() => void setActivo(u.id, !u.activo)}
                      className={`btn btn-sm ${
                        u.activo ? "btn-danger" : "btn-dark"
                      }`}
                    >
                      {u.activo ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsuarios;
